# API de recherche de livres

Petite API REST Express connectée à MongoDB. L’entité principale est le livre,
décrit par son titre, son auteur, sa description, son genre et éventuellement
son année de publication.

## Prérequis et lancement

- Node.js 18 ou plus récent
- MongoDB local ou une URI MongoDB accessible

Installez les dépendances, copiez `.env.example` vers `.env`, adaptez
`MONGODB_URI` si nécessaire, puis lancez :

```sh
npm install
npm start
```

En développement, `npm run dev` redémarre le serveur lorsqu’un fichier change.

## Routes

| Méthode | Route | Description |
| --- | --- | --- |
| `POST` | `/items` | Crée un livre |
| `GET` | `/items` | Liste les livres (`page` et `limit` facultatifs) |
| `GET` | `/items/:id` | Récupère un livre par son identifiant |
| `GET` | `/search?keyword=...` | Recherche sans distinction de casse dans le titre, l’auteur et la description |

La recherche accepte aussi `genre` comme filtre facultatif, par exemple
`/search?keyword=espace&genre=Science-fiction`. Le mot-clé est recherché par
expression régulière MongoDB (`$regex`) et les caractères spéciaux sont échappés.

Exemple de document à envoyer à `POST /items` :

```json
{
  "title": "Dune",
  "author": "Frank Herbert",
  "description": "Une épopée de science-fiction sur la planète Arrakis.",
  "genre": "Science-fiction",
  "publishedYear": 1965
}
```

Exemple :

```sh
curl "http://localhost:3000/search?keyword=arrakis&genre=Science-fiction"
```
