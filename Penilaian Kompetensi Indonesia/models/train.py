import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import numpy as np
import copy
from models.model import LabeledDataset, UnlabeledDataset, ValidationDataset, semisupervised
import os

from flask import jsonify, request

import psycopg2

# conn = psycopg2.connect(database="competence_classification", host="localhost", user="postgres", password="root", port="5432")
conn = psycopg2.connect(database="hiremif", host="0.tcp.ap.ngrok.io", user="postgres", password="postgres", port="16999")
cur = conn.cursor()

def setup_labeled():
    '''
    DALAM KASUS INI q merupakan singkatan query
    DALAM KASUS INI r merupakan singkatan result
    '''
    get_labeled_feedback_q = "SELECT transcript, competency_id, label_feedback FROM feedback_results WHERE status = 'LABELED' AND language = 'INDONESIAN';"
    cur.execute(get_labeled_feedback_q)
    labeled_feedback_r = cur.fetchall()

    transcripts_training_labeled = [row[0] for row in labeled_feedback_r]
    labels_training = []
    competence_sets_training_labeled = []

    get_competency_levels_q = "SELECT description, id FROM competency_levels WHERE competency_id = '%s'"

    for labeled_feedback in labeled_feedback_r:
        competency_id = labeled_feedback[1]
        label_feedback = labeled_feedback[2]
        cur.execute(get_competency_levels_q % competency_id)
        competency_levels_r = cur.fetchall()
        temp = []

        for count, competency_level in enumerate(competency_levels_r):
            competency_level_id = competency_level[1]
            competency_level_description = competency_level[0] 
            temp.append(competency_level_description)
            if label_feedback == competency_level_id:
                labels_training.append(count)

        competence_sets_training_labeled.append(temp)
    
    return transcripts_training_labeled, competence_sets_training_labeled, labels_training

def setup_unlabeled():
    get_unlabeled_feedback_q = "SELECT transcript, competency_id FROM feedback_results WHERE status <> 'LABELED' AND language = 'INDONESIAN';"
    cur.execute(get_unlabeled_feedback_q)
    unlabeled_feedback_r = cur.fetchall()

    transcripts_training_unlabeled = [row[0] for row in unlabeled_feedback_r]
    competence_sets_training_unlabeled = []

    get_competency_levels_q = "SELECT description FROM competency_levels WHERE competency_id = '%s'"
    for unlabeled_feedback in unlabeled_feedback_r:
        competency_id = unlabeled_feedback[1]
        cur.execute(get_competency_levels_q % competency_id)
        competency_levels_r = cur.fetchall()
        temp = []
        for competency_level in competency_levels_r:
            temp.append(competency_level[0])
        competence_sets_training_unlabeled.append(temp)

    return transcripts_training_unlabeled, competence_sets_training_unlabeled

transcripts_labeled, competence_sets_labeled, labels = setup_labeled()

# pembagian 7 : 2 dan hasil konsisten
total_data = len(labels)
print(total_data)
total_train = 7 * total_data // 9
total_val = total_data - total_train

transcripts_training_labeled, competence_sets_training_labeled, labels_training = transcripts_labeled[0:total_train], competence_sets_labeled[0:total_train], labels[0:total_train]
transcripts_validation, competence_sets_validation, labels_validation = transcripts_labeled[total_train:], competence_sets_labeled[total_train:], labels[total_train:]

print(labels)
print(labels_training)
print(labels_validation)

transcripts_training_unlabeled, competence_sets_training_unlabeled = setup_unlabeled()

cur.close()
conn.close()

def train_pseudo_label():
    global transcripts_training_labeled
    global competence_sets_training_labeled
    global labels_training
    global transcripts_training_unlabeled
    global competence_sets_training_unlabeled

    # Initialize datasets
    labeled_data = LabeledDataset(transcripts_training_labeled, competence_sets_training_labeled, labels_training)
    unlabeled_data = UnlabeledDataset(transcripts_training_unlabeled, competence_sets_training_unlabeled)
    validation_data = ValidationDataset(transcripts_validation, competence_sets_validation, labels_validation)

    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    tokenizer = AutoTokenizer.from_pretrained("LazarusNLP/indobert-lite-base-p1-indonli-multilingual-nli-distil-mdeberta")
    base_model = AutoModelForSequenceClassification.from_pretrained("LazarusNLP/indobert-lite-base-p1-indonli-multilingual-nli-distil-mdeberta")

    pseudo_label_dir = os.path.abspath("./trained_models/pseudolabel")
    os.makedirs(pseudo_label_dir, exist_ok=True)

    # TRAIN PSEUDOLABEL
    pseudo_trained_model = semisupervised(copy.deepcopy(base_model), tokenizer, device)

    batch_size = 2
    num_epochs = 5
    T1 = 1
    T2 = 4
    alpha_f = 3.0
    learning_rate = 1e-3

    pseudo_trained_model.train_pseudo_label(labeled_data, unlabeled_data, validation_data, batch_size, num_epochs, T1, T2, alpha_f, learning_rate)

    # SAVE UPDATED MODEL
    try:
        pseudo_trained_model.model.save_pretrained(pseudo_label_dir)
        tokenizer.save_pretrained(pseudo_label_dir)
        print(f"Pseudo Trained Model and Tokenizer saved successfully to {pseudo_label_dir}")
    except Exception as e:
        print(f"Error saving Pseudo Trained Model: {e}")
    
    return jsonify({"status": "success", "message": "Training pseudo label berhasil"}), 200

def train_ladder_gamma():
    global transcripts_training_labeled
    global competence_sets_training_labeled
    global labels_training
    global transcripts_training_unlabeled
    global competence_sets_training_unlabeled

    # Initialize datasets
    labeled_data = LabeledDataset(transcripts_training_labeled, competence_sets_training_labeled, labels_training)
    unlabeled_data = UnlabeledDataset(transcripts_training_unlabeled, competence_sets_training_unlabeled)
    validation_data = ValidationDataset(transcripts_validation, competence_sets_validation, labels_validation)

    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    tokenizer = AutoTokenizer.from_pretrained("LazarusNLP/indobert-lite-base-p1-indonli-multilingual-nli-distil-mdeberta")
    base_model = AutoModelForSequenceClassification.from_pretrained("LazarusNLP/indobert-lite-base-p1-indonli-multilingual-nli-distil-mdeberta")

    ladder_network_dir = os.path.abspath("./trained_models/laddernetwork")
    os.makedirs(ladder_network_dir, exist_ok=True)

    # TRAIN LADDER GAMMA
    ladder_trained_model = semisupervised(copy.deepcopy(base_model), tokenizer, device)

    batch_size = 2
    num_epochs = 5
    learning_rate = 1e-3

    ladder_trained_model.train_ladder_gamma(labeled_data, unlabeled_data, validation_data, batch_size, num_epochs, learning_rate)

    # SAVE UPDATED MODEL
    try:
        ladder_trained_model.model.save_pretrained(ladder_network_dir)
        tokenizer.save_pretrained(ladder_network_dir)
        print(f"Ladder Gamma Trained Model and Tokenizer saved successfully to {ladder_network_dir}")
    except Exception as e:
        print(f"Error saving Ladder Gamma Trained Model: {e}")

    return jsonify({"status": "success", "message": "Training ladder network berhasil"}), 200