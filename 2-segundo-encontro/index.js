import OpenAi from "openai";
import dotenv from "dotenv";
import {printMessagesCompletion} from "../utils/printMessagesCompletion.js";
import {promptMessage} from "../utils/prompt.js";
dotenv.config();

const openai = new OpenAi({apiKey: process.env.OPENAI_KEY});
const model = "gpt-3.5-turbo";

// Consultar o banco buscando por este CPF
function getClientDebit(cpf) {
    return [
        {id:121121, cpf: "01180151682", name: 'daniel', city: 'juiz de fora', debit: '123,45', accountStatus: 'canceled'},
        {id:121123, cpf: "06804501659", name: 'tiago', city: 'juiz de fora', debit: '99,99', accountStatus: 'canceled'},
    ];
}


const tools = [
    { "type": "function",
    "function": {
        "name": "getClientDebit",
        "description":"Obtem os débitos de um cliente a partir do seu CPF",
        "parameters": {
            "type": "object",
            "properties": {
                "cpf": {
                    "type": "string",
                    "description": "O CPF do cliente formatado como XXX.XXX.XXX-XX",
                }
            },
            "required": ["cpf"]
        }
    }}
];


async function main(){
    const messages = [{
        "role": "system",
        "content": `
        Você é um assistente que ajuda o usuário a saber quando ele tem de débito na empresa.
        Comece a pergunta, perguntando qual o CPF do usuário, para então informar o valor em aberto.
        Caso ele não fale, tente sempre novamente obter o CPF, e diga que precisa dele mesmo.
        `
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
            tools: messages.length>1? tools : null,
            model
        });

        // console.dir(completion,{depth:null});

        if (completion.choices[0].message.tool_calls){
            const toolCall = completion.choices[0].message.tool_calls[0];
            // console.log("toolCall", toolCall);

            if (toolCall.function.name == "getClientDebit"){
                const data = getClientDebit(JSON.parse(toolCall.function.arguments).cpf);
                // console.log("data", data);
                messages.push({
                    "role": "function",
                    "name": "getClientDebit",
                    "content": JSON.stringify(data)
                });

                const completionTool = await openai.chat.completions.create({
                    messages,
                    tools,
                    model
                });

                // console.dir(completionTool,{depth:null});
                messages.push(completionTool.choices[0].message);
            }
        } else {
            messages.push(completion.choices[0].message);
        }

        // console.log(completion.choices[0].message.content);
        printMessagesCompletion(messages, true);
    }
}

main().then();