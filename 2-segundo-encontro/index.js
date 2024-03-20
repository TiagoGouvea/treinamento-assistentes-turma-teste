import OpenAi from "openai";
import dotenv from "dotenv";
import {printMessagesCompletion} from "../utils/printMessagesCompletion.js";
import {promptMessage} from "../utils/prompt.js";
import axios from "axios";
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


// Obter a previsão do tempo
async function lookupWeather(location) {
    const options = {
        params: {q: location, content: location},
        headers: {
            'X-RapidAPI-Key': '9qrylbqOCnmshNNPZ2sQHCoOTi4qp1wN82ojsnHNW1TDIfd9UI',
            'X-RapidAPI-Host': 'weatherapi-com.p.rapidapi.com'
        }
    };

    try {
        const response = await axios.get('https://weatherapi-com.p.rapidapi.com/current.json',options);
        // console.log("lookupWeather", response.data);
        return response.data;
    } catch (error) {
        console.error(error);
        return "No forecast found";
    }
}

// Obter a previsão do tempo
async function getCountryInformation(countryName) {
    // console.log("getCountryInformation", countryName);

    try {
        const response = await axios.get('https://servicodados.ibge.gov.br/api/v1/paises/'+countryName);
        const countries =  response.data;
        // console.log("countries", countries.length);
        const pais = countries.filter(country=>
            country.nome.abreviado.toLowerCase() == countryName.toLowerCase() ||
            country.nome["abreviado-EN"].toLowerCase() == countryName.toLowerCase()
        );
        return pais;
    } catch (error) {
        console.error(error);
    }
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
        }
    },
    { "type": "function",
        "function": {
            "name": "lookupWeather",
            "description":"Obtem as informações de clima de uma cidade",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "Nome de uma cidade ou localidade",
                    }
                },
                "required": ["location"]
            }
        }
    },
    { "type": "function",
        "function": {
            "name": "getCountryInformation",
            "description":"Obtem as informações de um pais",
            "parameters": {
                "type": "object",
                "properties": {
                    "country": {
                        "type": "string",
                        "description": "Nome do pais"
                    }
                },
                "required": ["country"]
            }
        }
    }
];


async function main(){
    const messages = [{
        "role": "system",
        "content": `
        Você é um assistente que ajuda o usuário a saber quando ele tem de débito na empresa.
        Comece a pergunta, perguntando qual o CPF do usuário, para então informar o valor em aberto.
        Você também informa as condições do clima da cidade do usuário.
        Você também dá informações sobre paises.
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

            let data =null;

            console.log("toolCall.function.name",toolCall.function.name);

            if (toolCall.function.name == "getClientDebit"){
                data = getClientDebit(JSON.parse(toolCall.function.arguments).cpf);
            } else if (toolCall.function.name == "lookupWeather"){
                data = await lookupWeather(JSON.parse(toolCall.function.arguments).location);
            } else if (toolCall.function.name == "getCountryInformation"){
                data = await getCountryInformation(JSON.parse(toolCall.function.arguments).country);
            } else {
                console.error("Função chama inexistente: ",toolCall.function.name);
            }

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

        } else {
            messages.push(completion.choices[0].message);
        }

        // console.log(completion.choices[0].message.content);
        printMessagesCompletion(messages, true);
    }
}

main().then();