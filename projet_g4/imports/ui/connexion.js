//importation des méthodes
import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Semaines } from '../api/semaines.js';

//importation des fichiers
import './login.html';
import '../templates/login.html';
/*import '../templates/semaine.html';
import '../templates/newTr.html';
import '../templates/newTd.html';
import '../templates/semaineDays.html';*/

//variable constante pour faciliter le parcours de la base de donnée
const mesJours = [
      		"lundi",
      		"mardi",
     		"mercredi",
      		"jeudi",
      		"vendredi",
      		"samedi",
      		"dimanche"
    ];

//quand un utilisateur se connecte...
Accounts.onLogin(function(user){
	//...si il n'a pas de document avec son id dans la collection Semaines..
	if(Semaines.find({id_utilisateur: Meteor.userId()}).count() == 0){
		//...on lui assigne un document semaine par défaut (valeurs de 0 pour chaque cellules)
		Meteor.call("semaines.createDefault", Meteor.userId());
	}
	let mesScores = scoresUtilisateurCourant(Meteor.userId());
    //lancement de la fonction de création de tableaux
    creerTableau(mesScores, mesJours)
});

//fonction pour créer un tableau
function creerTableau(scores, jours){
	//test de l'envoi de données
	console.log(scores);
	//création d'un élément tableau, ajout d'un id
	let monTab = document.createElement("table");
	monTab.setAttribute("id", "semaine");
	document.body.appendChild(monTab);
	//tentative d'avoir un truc pour supprimer les éléments du tableau
	/*let monTabEmptier = document.getElementById("semaine");
	while(monTabEmptier.hasChildNodes()){monTabEmptier.removeChild(firstChild())}*/
	//système de deux boucles pour peupler le tableau
	for(let i=0;i<scores.length;i++){
		let monTr = document.createElement("tr");
		monTab.appendChild(monTr);
		for(let j=0;j<scores[i].length;j++){
			let monTd = document.createElement("td");
			//on ajoute aux td un id suivant le modèle "jour_heure"
			monTd.setAttribute("id", jours[i]+"_"+j);
			//on affiche son score
			monTd.value = scores[i][j];
			monTd.innerHTML = monTd.value;
			monTr.appendChild(monTd);
		}
	}
}

//Fonction qui retourne au tableau contenant les disponibilités d'un utilisateur donné
function scoresUtilisateurCourant(idUt){
    //tableau vide pour accueillir les scores
    const mesScores = [];
    //boucle qui va chercher les scres de chaque jour et les stocke dans un array à deux dimensions
    for(let i=0;i<7;i++){
      	const doc = Semaines.findOne({ id_utilisateur: idUt });
      	const array = doc[mesJours[i]];
      	mesScores.push(array);
    }
    return(mesScores);
}

Template.login.events({
	//quand on clique sur le bouton ayant pour class "semaine" (fonctionnera avec un tableau dont les td ont cette class)
	'click .semaine': function(event){
		//on empêche le comportement par défaut
		event.preventDefault();
		//on récupère la value (le score) de l'élément sur lequel au clique
		const elemVal = parseInt(event.currentTarget.value);
		//on récupère son id, qu'on sépare à l'underscore pour avoir d'un côté le jour et de l'autre l'id de l'heure
		const elem = event.currentTarget.id;
		let elemStr = String(elem);
		let elemTab = elemStr.split("_");
		let jour = elemTab[0];
		let heure = parseInt(elemTab[1]);
		//vérification des infos envoyées (à supprimer pour le projet final)
		console.log(Meteor.userId()+" "+jour+" "+heure+" "+elemVal);
		//appel de la méthode semaines.updateTable
		//à voir si l'id de la semaine n'est pas plus pertinent. Cependant il faut voir où le stocker pour le vérifier dans la méthode
		Meteor.call("semaines.updateTable", Meteor.userId(), jour, heure, elemVal);
	},
	'click .pressMe': function(event){
		event.preventDefault();
    	let idUt2 = event.currentTarget.id;
    	//tableau vie pour accueillir les scores
    	const mesScores1 = scoresUtilisateurCourant(Meteor.userId());
    	const mesScores2 = scoresUtilisateurCourant(idUt2);
    	//double boucles imbriquées qui stockent les informations compilées de deux tableaux de disponibilité sous la forme d'un array à deux dimensions
    	const mesScores3 = [];
    	for(let i=0;i<mesScores1.length;i++){
    		let placeHolder = [];
    		for(let j=0;j<mesScores1[i].length;j++){
    			let calcul = (mesScores1[i][j] + mesScores2[i][j])/2;
    			placeHolder.push(calcul);
    		}
    		mesScores3.push(placeHolder);
    	}
    	//lancement de la fonction de création de tableau avec, en donnée, l'array compilant les deux tableaux
    	creerTableau(mesScores3, mesJours);
	}
});