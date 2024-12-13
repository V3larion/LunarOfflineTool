const fs = require('fs');
const path = require('path');

const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log(`Lunar Client Offline Account Manager Tool - By Velarion.\n`);

const menu = [
    `Please Choose An Option\n
    1. Add an account,
    2. Remove an account,
    3. List accounts,
    4. Credits,
    5. Exit\n\n--> `
]

async function askQuestion(question){
    return new Promise(resolve => rl.question(question, resolve));
}

async function openMenu(){
    for(let question of menu){
        async function appMenu(){
            const answer = await askQuestion(question);
    
            switch(answer){
                case '1':
                    await addAccount();
                    break;
                case '2':
                    await removeAccount();
                    break;
                case '3':
                    await listAccounts();
                    break;
                case '4':
                    await credits();
                    break;
                case '5':
                    rl.close();
                    console.log(`\nThank you for using this tool.`);
                    process.exit();
                default:
                    console.log('\nInvalid option. Please try again. Only values from 1-5 are accepted.\n\n--> ');
            }
        }
    
        appMenu();
    };
}

openMenu();

const filePath = path.join(
    process.env.HOME || process.env.USERPROFILE, 
    '.lunarclient', 
    'settings', 
    'game', 
    'accounts.json'
);

function getAccountsFile() {
    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        const accounts = JSON.parse(data);
        return accounts;
    } catch (error) {
        console.error('Error reading accounts.json:', error);
    }
}

async function addAccount() {
    const questions = [
        `\nUsername ( IGN ): `,
        `UUID ( Of an account with the skin you want ): `
    ];

    let answers = [];

    for(let question of questions){
        const answer = await askQuestion(question);
        answers.push(answer);
    }

    const username = answers[0];
    const uuid = answers[1];

    const accounts = getAccountsFile() || { accounts: {} };

    accounts.accounts[uuid] = {
        accessToken: uuid,
        accessTokenExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        eligibleForMigration: false,
        hasMultipleProfiles: false,
        legacy: true,
        persistent: true,
        userProperites: [],
        localId: uuid,
        minecraftProfile: { id: uuid, name: username },
        remoteId: uuid,
        type: 'Xbox',
        username: username,
    }

    fs.writeFileSync(filePath, JSON.stringify(accounts, null, 4));

    console.log(`Added account "${username}" with UUID "${uuid}"`);

    end();
}

async function removeAccount() {
    const questions = [
        `\nUUID ( Of the account you want to get rid of ): `
    ];

    let answers = [];

    for(let question of questions){
        const answer = await askQuestion(question);
        answers.push(answer);
    }

    const uuid = answers[0];

    const accounts = getAccountsFile();

    if(!accounts){
        return console.log(`No accounts were found on your system.`);
    }

    if(accounts.accounts[uuid]){
        delete accounts.accounts[uuid];
        fs.writeFileSync(filePath, JSON.stringify(accounts, null, 4));
        console.log(`Removed account with UUID "${uuid}"`);
    }else{
        return console.log(`Account with the UUID ${uuid} not found on your system.`);
    }

    end();
}

async function listAccounts() {
    const accounts = getAccountsFile();

    if(!accounts){
        return console.log(`No accounts were found on your system.`);
    }

    console.log('\nAccounts:\n');

    for(let uuid in accounts.accounts){
        const account = accounts.accounts[uuid];
        console.log(`Username: ${account.username}, UUID: ${uuid}`);
    }

    end();
}

async function credits(){
    console.log(`\nMade by Velarion\nOpen Source\nEditing, Re-distributing and Contributions are fully allowed.\nThank you for using this tool.`);
    end();
}

async function end(){
    console.log(`\nYou will be returned to the menu in 3 seconds`);

    setTimeout(()=>{
        console.clear();
        openMenu();
    },3000);
}