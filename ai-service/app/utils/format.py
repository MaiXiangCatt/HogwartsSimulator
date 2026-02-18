from google.genai import types


def convert_to_gemini_format(messages: list):
    system_instruction = None
    contents = []

    for m in messages:
        role = m["role"]
        content = m["content"]

        if role == "system":
            # 如果有多个 system，拼接起来
            if system_instruction:
                system_instruction += "\n" + content
            else:
                system_instruction = content
        elif role == "user":
            contents.append(
                types.Content(role="user", parts=[types.Part(text=content)])
            )
        elif role == "assistant":
            contents.append(
                types.Content(role="model", parts=[types.Part(text=content)])
            )

    return system_instruction, contents
