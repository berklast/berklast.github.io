import gradio as gr
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

MODEL_ID = "Qwen/Qwen2.5-0.5B-Instruct"  # küçük -> ücretsiz CPU'da daha mümkün
SYSTEM = "Türkçe konuş. Kısa, net, yardımcı cevap ver. Roblox/Lua konusunda özellikle iyisin."

tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_ID,
    device_map="auto",
    torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32
)

def chat(message, history):
    # history: [[user, assistant], ...]
    messages = [{"role": "system", "content": SYSTEM}]
    for u, a in history:
        messages.append({"role": "user", "content": u})
        messages.append({"role": "assistant", "content": a})
    messages.append({"role": "user", "content": message})

    prompt = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    inputs = tokenizer([prompt], return_tensors="pt").to(model.device)

    out = model.generate(
        **inputs,
        max_new_tokens=300,
        do_sample=True,
        temperature=0.7,
        top_p=0.9,
        repetition_penalty=1.05
    )

    gen = out[0][inputs["input_ids"].shape[-1]:]
    text = tokenizer.decode(gen, skip_special_tokens=True).strip()
    return text

demo = gr.ChatInterface(
    fn=chat,
    title="Berklast AI",
    api_name="chat"   # endpoint adı
)

demo.launch()
