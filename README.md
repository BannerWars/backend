# BannerWars Backend
this is the backend to the banner wars project.
For more information as to what banner wars is, please check out [The Main Website](#) this repositiory is for internal use only

## Models
* ### __User__  
    Users are to keep track of the individual user credintials, as well as auth.
    | Attribute | Description          |
    | --------- | -------------------- |
    | _id       | The uuid of the user |

* ### __Lobby__  
    lobbies are the core of banner wars. They keep track of users, teams, and banners.
    | Attribute | Description                                                          | notes                                    |
    | --------- | -------------------------------------------------------------------- | ---------------------------------------- |
    | _id       | The uuid of the lobby                                                |                                          |
    | name      | The name of the lobby given by the creator of the lobby              |                                          |
    | teams     | An array of the ids of the teams inside the lobby                    |                                          |
    | banners   | an array of the ids of all the banners in the lobby                  | not sure if I want this here or in teams |
    | active    | A boolean, if true there is a war going on and banners can be stolen |                                          |
    | history   | An array of every theft that has ever happened                       |                                          |
* ### __Team__  
    Teams keep track of what banners are in their possesion
    | Attribute | Description                                           |
    | --------- | ----------------------------------------------------- |
    | _id       | The uuid of the team                                  |
    | name      | The name of the team given by the creator of the team |
    | users     | an array of user ids who are on the team              |
* ### __Banner__  
    Banners are the blood of the game. Each team starts a war with their own banner. Banners can be stolen by other teams. this transfers the stolen banner from the original team to the new team.
    | Attribute | Description                                                       | notes                                    |
    | --------- | ----------------------------------------------------------------- | ---------------------------------------- |
    | _id       | The uuid of the user                                              |                                          |
    | name      | The name of the banner, containing the name of the original team  |                                          |
    | owner     | The uuid of the team that is currently in possesion of the banner | not sure if I want this here or in teams |
    | image     | an image of the actual banner                                     |                                          |
