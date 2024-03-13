import OpenAi from "openai";
import dotenv from "dotenv";
import prompt from 'prompt';
import colors from '@colors/colors';
dotenv.config();

const openai = new OpenAi({apiKey: process.env.OPENAI_KEY});
const model = "gpt-3.5-turbo";

// Consumindo modelo local (LM Studio / Ollama)
// const openai = new OpenAi({baseURL: 'http://localhost:1234/v1', apiKey: process.env.OPENAI_KEY});
// const model = "local-model";


async function main(){
    const messages = [{
        "role": "system",
        "content": `
        Você é um assistente que responde perguntas sobre a App Masters.
        Comece a conversa dando bom dia e perguntando o que a pessoa quer saber sobre a App Masters.
        Não conversar sobre outros assuntos. Responda apenas o que encontrar com base nas informações abaixo:
        
        A App Masters (www.appmasters.io) fundada por Tiago Gouvêa 2017, onde coordena pequenas equipes de desenvolvedores, desenvolvendo sistemas web e mobile para empresas de outros paises, mas também para o Brasil.
        Já fizemos projetos para clientes nos EUA, Canadá, Suiça, Portugal e Alemanha. Fizemos projetos para a prefeitura de Juiz de Fora, inclusive três deles voltados para combate aos impactos causados pela pandemia.
        A App Masters dá suporte para empresas nascentes, ajudando na validação de ideas, escolha de tecnologia e também na contratação e capacitação do time de desenvolvimento.
        Um MVP (web ou mobile) pode ser desenvolvido entre 1 e 3 meses, e pode custar entre 30 e 90 mil reais. Já um sistema mais robusto custará valores maiores que 100 mil.
        Aplicativos para celular simples partem de cerca de 60 mil reais com entrega em três meses. Projetos mais complexos exigem investimentos maiores.
        Trabalhamos também com alocação de time cobrada por hora.Temos uma equipe pronta para começar projetos em poucos dias.
        Não desenvolvemos websites, apenas sistemas web e aplicativos.
        Provedores cloud usamos AWS, GCP, Heroku, Vercel e Firebase. Nossa stack é JavaScript, com React, Next e Node. Mas sobre nossas tecnologias podem ser visto em www.appmasters.io/pt/tecnologias.
        Pode ser que tenhamos alguma vaga em aberto. Os processos de seleção da empresa acontecem exclusivamente pela plataforma https://programador.emjuizdefora.com/.
        Se as infomações acima não forem suficientes, responder com base no conteúdo de www.appmasters.io.
        
        + Não conversar sobre outros assuntos. Responda apenas o que encontrar com base nas informações acima.
        
        `
        // "Sempre responda no formato: {language: 'nome da linguagem', response: 'Sua respota'}"
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
        // conferir se a pergunta tem a palavra "X", se tiver incluir um message system com informações

        messages.push(completion.choices[0].message);

        // console.log(completion.choices[0].message.content);
        printMessages(messages, true);
    }

    // console.dir(completion,{depth:null});
}

async function isProgrammingLanguage(message){
        const completion = await openai.chat.completions.create({
                messages:[
                    {"role": "system","content": `Você responde apenas "sim" ou "não", se na mensagem abaixo, existe uma linguagem de programação ou framework.`},
                    {"role": "user", "content": message}
                ],
            model
        });

        console.log(completion.choices[0].message.content);
        return completion.choices[0].message.content.toLowerCase().includes("sim");
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