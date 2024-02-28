import OpenAi from "openai";
import dotenv from "dotenv";
import prompt from 'prompt';
import colors from '@colors/colors';
dotenv.config();

const openai = new OpenAi({apiKey: process.env.OPENAI_KEY});

async function main(){
    const messages = [{
        "role": "system",
        "content": "Você é um assistente que ajuda a montar um plano de estudo com base em uma tecnologia." +
            "O usuário enviar uma tecnologia, e você montará um plano contendo:" +
            "- Conceitos fundamentais" +
            "- Primeiros passos" +
            "- Documentação e links uteis" +
            "- Projeto prático" +
            "Logo no começo da conversa, já pergunte qual tecnologia a pessoa quer aprender."
    }];

    while (true){
        if (messages.length>1){
            const question = await promptMessage();

            messages.push({
                "role": "user",
                "content": question
            });
        }

        const completion = await openai.chat.completions.create({
            messages,
            model: "gpt-3.5-turbo"
        });

        // conferir se a pergunta tem a palavra "X", se tiver incluir um message system com informações

        messages.push(completion.choices[0].message);

        // console.log(completion.choices[0].message.content);
        printMessages(messages, true);
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


function printMessages(messages, justLast) {
    if (justLast) messages = [messages[messages.length-1]];

    messages.map((msg) => {
        if (msg.role == 'user') {
            console.log(colors.magenta(msg.content));
        } else if (msg.role == 'assistant') {
            console.log(colors.green(msg.content));
        }
        if (msg.metadata) {
            console.log('🔥 metadata', msg.metadata);
        }
    });
}

main().then();