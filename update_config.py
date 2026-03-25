import json
config_path = r'C:\Users\y2k1\.openclaw\openclaw.json'
with open(config_path, 'r', encoding='utf-8') as f:
    config = json.load(f)
    
# Set agents.defaults.model
if 'agents' not in config:
    config['agents'] = {}
if 'defaults' not in config['agents']:
    config['agents']['defaults'] = {}
if 'model' not in config['agents']['defaults']:
    config['agents']['defaults']['model'] = {}

config['agents']['defaults']['model']['primary'] = 'openrouter/qwen/qwen3-coder:free'
config['agents']['defaults']['model']['fallbacks'] = ['openrouter/free', 'openrouter/nvidia/nemotron:free', 'openrouter/deepseek/deepseek-r1:free']
config['agents']['defaults']['model']['models'] = ['openrouter/qwen/qwen3-coder:free', 'openrouter/free', 'openrouter/nvidia/nemotron:free', 'openrouter/deepseek/deepseek-r1:free']

with open(config_path, 'w', encoding='utf-8') as f:
    json.dump(config, f, indent=2, ensure_ascii=False)

print('Config updated successfully!')
