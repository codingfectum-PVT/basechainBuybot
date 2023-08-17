const axios = require("axios");
const fetch = require("node-fetch");
const cron = require("node-cron");
const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();
const {
  tokenContractAddress,
  basescanApiKey,
  routefrom,
  routecontractAddress,
  botToken,
  APIURL,
} = process.env;


// {
// tokenContract : track token 
// basescanApiKey : Scan
// routefrom : Get buys
// routecontractAddress : routeraddress
// botToken : Telegrambot token
// APIURL : Custom APi which connects to the database
// }


const bot = new TelegramBot(botToken, { polling: true });
//Basescan Api
const apiEndpoint = `https://api.basescan.org/api?module=account&action=tokentx&address=${tokenContractAddress}&sort=desc&apikey=${basescanApiKey}`;

// start command start your bot
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    "Welcome to the Token Info Bot! Type /info to get token details Type /latestTx to get token details."
  );
});

// info command send you token information
bot.onText(/\/info/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    const response = await axios.get(
      "https://api.basescan.org/api?module=account&action=txlist&address=0xaaFe31325FBC4D83C0cd274a8ec099eaC9053ECc&apikey=J3D2WPT4I2DSTEFM1XZCR6RIDTWMSYF9YZ"
    );

    if (response.status === 200 && response.data.status === "1") {
      const transactions = response.data.result;
      const uniqueAddresses = [
        ...new Set(
          transactions
            .map((tx) => tx.from)
            .concat(transactions.map((tx) => tx.to))
        ),
      ];
// send unique lp pairs
      console.log("Unique LP Addresses:", uniqueAddresses);
    } else {
      console.error("Failed to retrieve LP addresses");
    }
  } catch (error) {
    console.error("Error fetching LP addresses:", error.message);
  }

  // try {
  //   const totalSupply = await getTokenTotalSupply();
  //   const tokenPrice = await getTokenPrice();

  //   const marketCap = totalSupply * tokenPrice;

  //   bot.sendMessage(
  //     chatId,
  //     `Total Supply: ${totalSupply/1e18} tokens\nPrice: ${tokenPrice} USD\nMarket Cap: ${marketCap} USD`
  //   );
  // } catch (error) {
  //   bot.sendMessage(
  //     chatId,
  //     "An error occurred while fetching token details. Please try again later."
  //   );
  //   console.log(error);
  // }
});

bot.onText(/\/latestTx/, async (msg) => {
  setInterval(async () => {
    const chatId = msg.chat.id;
    let apiData = await fetch(APIURL+"/getHash", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    let data = await apiData.json();
    let oldBuyHash = data.transactionHash;
    try {
      const totalSupply = await getTokenTotalSupply();
      const tokenPrice = await getTokenPrice();

      const marketCap = totalSupply * tokenPrice;
      const pushData = [];
      const promises = [];
      for (let i = 1; i <= 1; i++) {
        promises.push(axios.get(apiEndpoint));
      }

      //all buys push in new array
      const responses = await Promise.all(promises);
      console.log("datalogslength", responses.length);
      responses.forEach((response, i) => {
        for (let j = 1; j <= 150; j++) {
          pushData.push(response.data.result[j]);
        }
      });

      for (const product of pushData) {
        if (
          product.from == routefrom &&
          product.contractAddress == routecontractAddress
        ) {
          const index = oldBuyHash?.find((item) => item === product?.hash);
          if (index !== undefined) {
            console.log("Old Transcation", product?.hash);
          } else {
            let apiDatasend = await fetch(
              APIURL+"/addHash",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ transactionHash: product.hash }),
              }
            );
            let data = await apiDatasend.json();
            // Check Success Entry or not while uncomment console
            // console.log("checkMessage", data.message);
            if (data.message == "succes") {
              await bot.sendMessage(
                chatId,
                `🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥 \n Transctions Hash: ${
                  product.hash
                } \n Got: ${product.value / 1e18}  ${
                  product.ADA
                } \n Total Supply: ${totalSupply} tokens\nPrice: ${tokenPrice} USD\nMarket Cap: ${marketCap} USD`
              );
            } else {
              // Dublicate Hash Show while uncomment console
              // console.log("data dublicated");
            }
          }
        } else {
          // Sell Hash Show while uncomment console
          // console.log("Sell",product.to)
        }
      }
    } catch (error) {
      bot.sendMessage(
        chatId,
        "An error occurred while fetching the latest transaction. Please try again later."
      );
      console.log(error);
    }
  }, 20000);
});

async function getTokenTotalSupply() {
  try {
    const response = await fetch(
      `https://api.basescan.org/api?module=stats&action=tokensupply&contractaddress=0xaaFe31325FBC4D83C0cd274a8ec099eaC9053ECc&apikey=${basescanApiKey}`
    );
    const data = await response.json();
    return data.result;
  } catch (error) {
    throw new Error("Failed to fetch total token supply.");
  }
}

async function getTokenPrice() {
  // TODO: Implement a logic to get the token price from an external source (e.g., a price oracle or API).
  // For simplicity, we'll use a placeholder value of 1 USD here.
  return 0.083774;
}

// async function getLatestTokenTransaction() {
//   try {
//     const response = await axios(apiEndpoint);
//     const data = await response.json();
//     const transactions = data.result;
//     if (transactions && transactions.length > 0) {
//       return transactions;
//     } else {
//       throw new Error("No token transactions found.");
//     }
//   } catch (error) {
//     throw new Error("Failed to fetch latest token transaction.");
//   }
// }
