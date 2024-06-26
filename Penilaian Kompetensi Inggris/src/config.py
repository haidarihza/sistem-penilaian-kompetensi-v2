from pydantic_settings import BaseSettings, DotEnvSettingsSource, JsonConfigSettingsSource
from typing import ClassVar

import json
import os


class Settings(BaseSettings):
    # config.json
    cfg_attr: ClassVar[list[str]] = ["cm_model_name", "cm_model_dir", "cm_model_type", "cm_state_dict_dir", "cm_state_dict_filename"]
    cm_model_name: str
    cm_model_dir: str
    cm_model_type: str
    cm_state_dict_dir: str
    cm_state_dict_filename: str

    # param_config.json
    param_cfg_attr: ClassVar[list[str]] = ["al_batch_size", "al_bayesian_samples"]
    al_batch_size: int
    al_bayesian_samples: int
    
    # .env
    env_attr: ClassVar[list[str]] = ["database_user", "database_password", "database_host", "database_port", "database_name"]
    database_user: str
    database_password: str
    database_host: str
    database_port: str
    database_name: str

    @classmethod
    def settings_customise_sources(
        cls,
        settings_cls,
        init_settings,
        env_settings,
        dotenv_settings,
        file_secret_settings,
    ):
        return DotEnvSettingsSource(settings_cls, ".env"), JsonConfigSettingsSource(settings_cls, "config.json")

    def update_json(self):
        with open('config.json', 'w') as f:
            json.dump(self.model_dump(include=self.cfg_attr), f, indent=4)
        
        with open('param_config.json', 'w') as f:
            json.dump(self.model_dump(include=self.param_cfg_attr), f, indent=4)

    def get_model_path(self):
        return os.path.join(os.getcwd(), self.cm_model_dir)
    
    def get_state_dict_dir(self):
        return os.path.join(os.getcwd(), self.cm_state_dict_dir, self.cm_model_name)
    
    def get_state_dict_path(self):
        if self.cm_state_dict_filename is None or self.cm_state_dict_filename == "":
            return None
        
        return os.path.join(self.get_state_dict_dir(), self.cm_state_dict_filename)
    