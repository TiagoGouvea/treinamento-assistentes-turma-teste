import OpenAi from "openai";
import dotenv from "dotenv";
import prompt from 'prompt';
import colors from '@colors/colors';
dotenv.config();

const openai = new OpenAi({apiKey: process.env.OPENAI_KEY});
const model = "gpt-3.5-turbo";

// agendamento -
// precos - sobre precos de serviços, prazos, condições
// reservas -
// {mensagem} - Quanto custa um aplicativo?

function getClientDebit(cpf) {
    // Consultar o banco buscando por este CPF

    // Retornar o total de debito
    // console.log("getClientDebit", cpf);

    return `
    {id:121121, cpf: 01180151682, name: 'daniel', city: 'juiz de fora', debit: '123,45', accountStatus: 'canceled'}"
    {id:121123, cpf: 06804501659, name: 'tiago', city: 'juiz de fora', debit: '99,99', accountStatus: 'canceled'}"
    `;

    // return "TotalDebit: R$"+100;
}



async function main(){
    const messages = [{
        "role": "system",
        "content": `
        Você é um assistente que ajuda o usuário a saber quando ele tem de débito na empresa.
        Comece a pergunta, perguntando qual o CPF do usuário, para então informar o valor em aberto.
        Caso ele não fale, tente sempre novamente obter o CPF, e diga que precisa dele mesmo.
        Quando o usuário falar um cpf, retorne a mensagem usando o formato JSON abaixo:
        {"cpf":"011.801.516-82", "metodo":"checarDebito"}
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
            model
        });

        // console.dir(completion,{depth:null});

        const isJson = isJsonString(completion.choices[0].message.content);
        // console.log("isJson", isJson);
        if (isJson){
            const params = JSON.parse(completion.choices[0].message.content);
            const debit = getClientDebit(params.cpf);
            messages.push({
                "role": "system",
                "content": `
                Não apresente um JSON.
                Informe ao usuário (em texto, sem ser JSON) que ele tem o seguinte valor de debito: 
                ${debit}
                Informa algo a mais sobre a conta dele.
                `
            });

            const completion2 = await openai.chat.completions.create({
                messages,
                model
            });

            messages.push(completion2.choices[0].message);
            // console.dir(completion2,{depth:null});
        } else {
            messages.push(completion.choices[0].message);
        }

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

function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

main().then();