const {isNonNullString} = require("@fto-consult/electron-gen/utils");

module.exports = {
    command: 'fto-consult <action>',
    //@see : https://github.com/neutralinojs/neutralinojs-cli/blob/main/src/modules/index.js
    
    register: (command, modules) => {
        command
            .argument('<cmd>', 'la commande à exécuter (create,start,init,build,package). Start permet de démarrer le script de l\'application, init permet d\'initialiser l\'application, build permet de compiler le code expo (exporter), package permet d\'effectuer le packaging de l\'application pour la distribution')
            .option('-c,--create [appName]',"create neu app name")
            .option("--app-id [appId]","application id, usage with --create command")
            .option('-o, --out [dir]', 'le chemin du répertoire qui contiendra les fichiers générés à l\'aide de la commande make : ; commande : make')
            .option('-u, --url [url]', 'le lien url qui sera ouvert par l\'application; commande start')
            .option('-b, --build [boolean]', 'si ce flag est spécfifié alors l\'application sera compilée; combinée avec la commande start|package pour indiquer que l\'application sera à nouveau exportée ou pas.')
            .option('-p, --platform [platform]', 'la plateforme à utiliser pour la compilation; commande package')
            .option('-l, --icon [iconPath]', 'le chemin vers le dossier des icones de l\'application : (Dans ce dossier, doit contenir une image icon.ico pour window, icon.incs pour mac et icon.png pour linux)')
            .option('-i, --import [boolean]', 'la commande d\'initialisation du package electron forge, utile pour le packaging de l\'application. Elle permet d\'exécuter le cli electron package, pour l\'import d\'un projet existant. Commande package. exemple : expo-ui electron package --import')
            .option('-f, --framework [frameworkName]', `Le nom du framework utilisé pour générer l\'application electron. Les frameworks supportés sont pour l\'instant : [${Object.keys(supportedFrameworks)}]. Le framework [expo] est le framework par défaut`)
            .action(async (action, command) => {
                // Make app 
                action = isNonNullString(action)? action.toLowerCase().trim() : "";
                console.log(action," is acciton ddddd",command.args," is command arguments",process.argv);
                switch(action){
                    case "create":
                        const appName = command
                        await modules.creator.createApp(appName);
                        break;
                }
                if(isNonNullString(command.create)){
                    
                    //console.log(`Please check the ${binaryName}/dist folder and find your desktop app.`);
                }
                if(isNonNullString(command.appId)){
                    modules.config.update('applicationId', command.appId.trim());
                }
                modules.config.update('action', action);
                modules.config.update('modes.window.enableInspector', false);
                modules.config.update('modes.window.exitProcessOnClose', true);
                module.config.update("modes.window.extendUserAgentWith","@fto-consult/neu");
                // Bundle it
                //await modules.bundler.bundleApp(true);
                if(typeof modules !=="undefined"){
                    console.log(modules," are modules heeee");
                }
                console.log(module.config," are module config");
            })
    }
};