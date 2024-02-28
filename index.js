import OpenAi from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAi({apiKey: process.env.OPENAI_KEY});

async function main(){
    console.log("oi");
    const completion = await openai.chat.completions.create({
        messages: [
            {
                "role": "user",
                "content": "Bom dia!"
            }
        ],
        model: "gpt-3.5-turbo"
    });
    console.dir(completion,{depth:null});
}

main().then();