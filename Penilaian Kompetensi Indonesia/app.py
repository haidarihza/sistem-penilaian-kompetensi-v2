from flask import Flask
from models.predict import get_pseudo_label_predictions, get_ladder_network_predictions
from models.train import train_pseudo_label, train_ladder_gamma
from flask import jsonify, request

app = Flask(__name__)

@app.route('/predict/pseudolabel', methods=['POST'])
def predict_pseudolabel():
    return get_pseudo_label_predictions()

@app.route('/predict/laddernetwork', methods=['POST'])
def predict_laddernetwork():
    return get_ladder_network_predictions()

@app.route('/train/pseudolabel', methods=['POST'])
def train_pseudo_label_model():
    return train_pseudo_label()

@app.route('/train/laddernetwork', methods=['POST'])
def train_ladder_network_model():
    return train_ladder_gamma()

if __name__ == '__main__':
    app.run(port=5000, debug=True)