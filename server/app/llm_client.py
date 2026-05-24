from huggingface_hub import InferenceClient
from dotenv import load_dotenv, find_dotenv
load_dotenv(find_dotenv())
import os

load_dotenv("backend/.env")

client = InferenceClient(
    provider="novita",
    api_key=os.getenv("HF_TOKEN"),
)

def explain_deadlock(deadlock_info: dict) -> str:
    """
    Deadlock info lo aur LLM se explanation lo
    """
    prompt = f"""You are a database expert. Analyze this deadlock situation and explain it simply.

Deadlock Information:
- Transaction 1: {deadlock_info['tx1_name']} was holding {deadlock_info['tx1_holding']} and waiting for {deadlock_info['tx1_waiting']}
- Transaction 2: {deadlock_info['tx2_name']} was holding {deadlock_info['tx2_holding']} and waiting for {deadlock_info['tx2_waiting']}

Please provide:
1. Simple explanation of what happened
2. Which transaction should be killed and why
3. How to prevent this in future

Keep response concise and clear."""

    message = client.chat.completions.create(
        model="meta-llama/Llama-3.3-70B-Instruct",
        messages=[
            {"role": "user", "content": prompt}
        ],
        max_tokens=500,
    )

    return message.choices[0].message.content


if __name__ == "__main__":
    # Test karo
    test_deadlock = {
        "tx1_name": "Tx_Alpha",
        "tx1_holding": "Table_Orders",
        "tx1_waiting": "Table_Users",
        "tx2_name": "Tx_Beta",
        "tx2_holding": "Table_Users",
        "tx2_waiting": "Table_Orders"
    }

    print("🤖 Taking explanation from LLM...")
    result = explain_deadlock(test_deadlock)
    print("\n📝 LLM Response:")
    print(result)