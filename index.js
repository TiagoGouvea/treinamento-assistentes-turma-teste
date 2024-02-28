import OpenAi from "openai";
import dotenv from "dotenv";
import prompt from 'prompt';
import colors from '@colors/colors';
dotenv.config();

const openai = new OpenAi({apiKey: process.env.OPENAI_KEY});

async function main(){
    const messages = [];

    while (true){
        const question = await promptMessage();

        messages.push({
            "role": "user",
            "content": question
        });

        const completion = await openai.chat.completions.create({
            messages,
            model: "gpt-3.5-turbo"
        });

        messages.push(completion.choices[0].message);

        // console.log(completion.choices[0].message.content);
        console.log(messages);

    }

    // console.dir(completion,{depth:null});
}




export async function promptMessage() {
    try {
        prompt.message = '';
        prompt.delimiter = '';
        const res = await prompt.get({
            properties: {
                message: {
                    description: colors.magenta('Mensagem>'),
                },
            },
        });
        if (res.message?.trim() !== '') return res.message;
    } catch (e) {
        if (e.message === 'canceled') {
            process.exit();
        }
        console.error(e);
    }
}


main().then();