const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

async function callOpenAI(letter) {
  const { data } = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a spanish tutor playing the word chain game.' },
        {
          role: 'user',
          content: `Can you send me a one-word response in Spanish that starts with the letter ${letter}? Please don't provide the English translation`,
        },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );
  console.log(data);
  const obj = {
    id: data.id,
    message: data.choices[0].message.content,
  };
  console.log(obj);
  return obj;
}

async function callOpenAIChat(chat) {
  const { data } = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a Spanish tutor, who primarily speaks in Spanish and only speaks in English when asked for a translation.' },
        {
          role: 'user',
          content: `${chat}`,
        },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );
  console.log(data);
  const obj = {
    id: data.id,
    message: data.choices[0].message.content,
  };
  console.log(obj);
  return obj;
}

async function callTranslateAPI(word) {
  const encodedParams = new URLSearchParams();
  encodedParams.set('text', `${word}`);
  encodedParams.set('to', 'en');
  encodedParams.set('from', 'es');

  const options = {
    method: 'POST',
    url: 'https://nlp-translation.p.rapidapi.com/v1/translate',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'X-RapidAPI-Key': `${process.env.API_KEY_NLP}`,
      'X-RapidAPI-Host': 'nlp-translation.p.rapidapi.com',
    },
    data: encodedParams,
  };

  try {
    const response = await axios.request(options);
    // console.log(response);
    const translation = response;
    return translation;
  } catch (error) {
    console.error(error);
  }
}

module.exports = { callOpenAI, callOpenAIChat, callTranslateAPI };
