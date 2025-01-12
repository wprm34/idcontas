import axios from 'axios';

const options = {
  method: 'GET',
  url: 'https://tiktok-api23.p.rapidapi.com/api/user/followers',
  params: {
    secUid: 'MS4wLjABAAAA3iMkzfXhm41Kb95MU9tdJ1atYGEHz6aWSPk4OXmR3rZnqPbYd9kOqXcz02iNq-3j',
    count: '2000',
    minCursor: '0',
    maxCursor: '0'
  },
  headers: {
    'x-rapidapi-key': 'f3dbe81fe5msh5f7554a137e41f1p11dce0jsnabd433c62319',
    'x-rapidapi-host': 'tiktok-api23.p.rapidapi.com'
  }
};

try {
	const response = await axios.request(options);
	console.log(response.data);
} catch (error) {
	console.error(error);
}
