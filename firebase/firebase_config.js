const admin = require("firebase-admin");
const firebaseConfig = {
  apiKey: "AIzaSyAe2Aw4qrqDHLGO3a1TIsT2BgCjqrsEeEE",
  authDomain: "startupgreeks.firebaseapp.com",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC2ohxx0/gwJUc4\nywRo1s0/ULE+q3ha9ph0ufORkE4Kdk06bgKL7IngssnQj/8dzlPiS7SuFsNtshbl\nqz0htjHvYwjr315gcfYF7QRbUikynqpObTcuGcoC1WiF7iBZS5HN40AMQrQA0LBq\nT2PIm7bZDsULXCCrrv/K7JxsfFeyHnEH0+sffvCZZ3gqaOjr9GISjtwoGUJyxWPm\nsFhkBQhGV0mcd3xDx+a1xHbSxVzCTYS3FE8yw52yCSyGQRn1m+D3X+oaRjzr6Q4W\nqNZX/fQ+A8cYS0oK9jza+Yh9QFjNTwRHbqHK99TkFtakOHoEBkhERGbrBXAYbZGh\nUyVmlAnvAgMBAAECggEASdKvgsd27Cc1adyOdL5XCr/YVYfER6ikKZK8xNs64Hm/\nb93mA59igERk1XxPWEH9oFyPtUsYRfAV11JnjIf0GVrD0Wxh3sRR+UU8XJmSc5a1\nKqx1AJqGEK0o6fI+eznTvxCb5BjWX/n7RY2/vOhMeeLBfX0I67z6QpFwDV4ZqLJ6\nZfDoFLDFBSPL2pQ3afTGpvcfPTm9bUSK0t4w0KDAw6DCcCOIhnNsKB0B0c71ITXt\ncUrgveeSE5QcO1qLS5Cr9HcgP2j7M64oO0a/D/UOLSfsbsf+PjEpfI2eVZWnkU6n\n3I6ede1xzJfKj5N3Mkw6aC0d4Q6TDAsvac6QGL4uEQKBgQD9XyDZtAdG6Ef3jV+D\nazV+fXbvLHXcFFPIBmhY0hLXsaEFYyta3wqWifGlOIAF1I/wcAi0n/4czUDUfhWe\nccj3mIq6ymfeGDRmjJqqiVr+ZyA+XqPQC+ab3cdN7bsdpZQ2B1gOeSDuuqVPR+XC\nDZsDaLTFkrt0VkeOAyrI2gaGdwKBgQC4hx//IWCqiJN8VqVbva7P/Ku1x+FCpG2l\nWii/xbplzf47K4HzWyJjoO0YS0hCMtDaFe53sIrOfc4JoEweu6ukpCPFwCr1a0bW\nZOiRCXBUw3RHxNmrW0SM19No9quiC2dC/rV5j41wRkimZZIsIbfAAebB3IWqSate\nQ1RDs2heSQKBgQCWP2YMkyxJiQ68JtJ/7QBQ3Pe9RuExO8Ce+eXA3focfBIfTrpz\n7ZWqxWxNbJ7GVlFw5A7VhZa7359VItuRFKp24LdLoyFK25GfSjuha0hRWjgNpDOB\n+Lysqyw38wSlxP2JuHsoQf4ccwP6aok9tLG6qMmh66xLhapy9T/W0StTawKBgEjl\niKxfYTK9VZZPHHALlR2xMZxUZBbRokcqQOLRl/tTz1VMsL+UhxdYoZFxXBBaxssA\n0v4RjiRY6qY+3xNdDEe0WDVs3wuo34kewAlb8zZpKGyZxWu+WGxTbr8Og2s2mgqL\nWOG25icufNDPW1l30IFXvvNizKMjC0Hn00gTfe2RAoGAAZPvOVONWbUH1+xwpL0y\nKmmECpRU+p6QjzRYvHTJ0323En/dPfIcmBRGLLOR7mGLkCVtO0JTBsf/tIMD/PSj\nyyBOHk6VM2FwPY1hEh/xkY+xJkII92DUy4Dqo6BxEzWQEPgvt4y9sQF0bpAIrHhE\nnNBcf+wEZw/w/w3RNvPFwdo=\n-----END PRIVATE KEY-----\n",
  projectId: "startupgreeks",
  storageBucket: "startupgreeks.appspot.com",
  messagingSenderId: "1052080727159",
  appId: "1:1052080727159:web:8f7f39443f20e369301272",
  measurementId: "G-YQQCZJH31T",
  client_email: "firebase-adminsdk-btxgz@startupgreeks.iam.gserviceaccount.com",
};

// Initialize Firebase
// const app = initializeApp(firebaseConfig);

var serviceAccount = require("./startupgreeks-firebase-adminsdk-btxgz-82228c262d.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: "startupgreeks",
});

module.exports = admin;
