#!/usr/bin/env node
const {isNonNullString,exec,isPlainObject,copy,JSONFileManager} = require("@fto-consult/electron-gen/utils");
const { program } = require('commander');
const path = require("path"), fs = require("fs");

//.argument('<cmd>', 'la commande à exécuter (create,start,init,build,package). Start permet de démarrer le script de l\'application, init permet d\'initialiser l\'application, build permet de compiler le code expo (exporter), package permet d\'effectuer le packaging de l\'application pour la distribution')
program
.option('-c,--create [appName]',"create neu app name")
.option("-t,--template [template]","neutralino template, usage on create cli")
.option("--app-id [appId]","application id, usage with --create command")
.option('-o, --out [dir]', 'le chemin du répertoire qui contiendra les fichiers générés à l\'aide de la commande make : ; commande : make')
.option('-u, --url [url]', 'le lien url qui sera ouvert par l\'application; commande start')
.option('-b, --build [boolean]', 'si ce flag est spécfifié alors l\'application sera compilée; combinée avec la commande start|package pour indiquer que l\'application sera à nouveau exportée ou pas.')
.option('-p, --platform [platform]', 'la plateforme à utiliser pour la compilation; commande package')
.option('-l, --icon [iconPath]', 'le chemin vers le dossier des icones de l\'application : (Dans ce dossier, doit contenir une image icon.ico pour window, icon.incs pour mac et icon.png pour linux)')
.option('-i, --import [boolean]', 'la commande d\'initialisation du package electron forge, utile pour le packaging de l\'application. Elle permet d\'exécuter le cli electron package, pour l\'import d\'un projet existant. Commande package. exemple : expo-ui electron package --import')

program.parse();  
const script = program.args[0];
const appName = program.args[1];
const options = program.opts();
const projectRoot = process.cwd();

action = isNonNullString(script)? script.toLowerCase().trim() : "";
switch(action){
    case "create":
        if(!isNonNullString(appName)){
            throw new Error(`Vous devez spécifier le nom de l' application neu à créer`);
        }
        const pPath = path.resolve(projectRoot,appName);
        const neuConfig = path.resolve(pPath,"neutralino.config.json");
        const end = (neuExists)=>{
            if(fs.existsSync(neuConfig)){
                const JSONManager = JSONFileManager(neuConfig);
                const exPath = JSONManager.get("cli.extensionsPath") || "/extensions/";
                const extensionsPath = path.resolve(pPath,exPath.ltrim("/").rtrim("/")).trim();
                const extDist = path.resolve(extensionsPath,"@fto-consult");
                copy(path.resolve(__dirname,"extensions","@fto-consult"),extDist);
                if(fs.existsSync(extDist)){
                    const etx = JSONManager.get("extensions");
                    const extensions = Array.isArray(etx)? etx : [];
                    const nExt = require("./extensions");
                    nExt.map((e)=>{
                        if(isNonNullString(e?.id)){
                            let hasF = false;
                            for(let i in extensions){
                                const ee = extensions[i];
                                if(ee?.id === e?.id){
                                    hasF = true;
                                    break;
                                }
                            }
                            if(!hasF){
                                extensions.push(e);
                            }
                        }
                    })
                    JSONManager.set({
                        extensions,
                    })
                }
                JSONManager.set({
                    enableExtensions: true,
                    cli : {extensionsPath:exPath},
                    modes : {
                        window : {
                            exitProcessOnClose : true,
                            extendUserAgentWith : "@fto-consult/neut",
                        }
                    }
                });
                JSONManager.save();
                console.log(`application ${appName} ${neuExists ===true?`déjà existante`:'créee avec succès'}`);
            }
        }
        if(fs.existsSync(neuConfig)){
            return end(true);
        }
        exec({cmd:`npx neu create ${appName}${options.template && `--template ${options.template}`||''}`,projectRoot}).then(end).catch((e)=>{
            const message = e?.message || e?.toString();
            console.error(`${message}`);
        });
        break;
    default : 
        require("@fto-consult/electron-gen/bin/index");
        break;
}