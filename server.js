const express = require('express')
const app = express()
const axios = require('axios')

let base_url_one = 'https://api.cricpick.in/games/view/'   // 59807
let base_url_two = '/1.1.json'
let all_matches_api = 'https://api.cricpick.in/games/listing/active/safe.json'
const expressLayouts = require('express-ejs-layouts')

app.set('view engine','ejs')
app.set('views',__dirname+'/views')
app.set('layout','layouts/layout')


app.use(expressLayouts)
app.use(express.json())
app.use(express.urlencoded({extended:false}))

app.get('/',async(req,res)=>{
    let response = await axios.post(all_matches_api)
    let data = response.data 
    let req_data = []
    data.result.games.forEach((match)=>{
        if(match.tournament.sport_category_id==2 || match.tournament.sport_category_id == 1 || match.tournament.sport_category_id == 3 || match.tournament.sport_category_id == 4)
        {
            req_data.push({
                id:match.id,
                home_team_name:match.home_team_code,
                away_team_name:match.away_team_code,
                home_team_image:match.home_team.logo,
                away_team_image:match.away_team.logo,
                series_name: match.tournament.name
            })
        }
    })
    
    
//    res.send(data)
    res.render('start',{req_data:req_data})
})

app.get('/match/:id',async(req,res)=>{
  //  console.log(req.query)
    res.render('index',{matchId:req.params.id,
        home_team_name:req.query.home,
        away_team_name:req.query.away,
        series_name:req.query.name})
})
let getRole = (position)=>{
    if(position==='wicketkeeper')
        return 1
    else if(position ==='batsman')
        return 2
    else if(position === 'allrounder')
        return 3 
    else 
        return 4 
}
app.post('/get_data',async (req,res)=>{
    const response = await axios.post(`${base_url_one}${req.body.matchId}${base_url_two}`);
    //console.log(response.data)
    let default_image = 'https://d13ir53smqqeyp.cloudfront.net/player-images/default-player-image.png'
    let data = response.data 
    let series_data = {}
    image_list_one =[]
    image_list_two =[]
    teams_image_list= []
    teams_image_list.push({
        title:data.game.home_team_code,
        src:data.game.home_team.logo
    })
    teams_image_list.push({
        title:data.game.away_team_code,
        src:data.game.away_team.logo
    })
    series_data.series_name = req.body.seriesName
    series_data.series_code = req.body.seriesCode
    series_data.image_present = 1 
    series_data.number_teams = 2
    series_data.gender = 1 // 1 for men and 0 for women
    series_data.team_list = [data.game.home_team_code,data.game.away_team_code]
    series_data.team_image_list=[data.game.home_team.logo,data.game.away_team.logo]
    // getting team -1 (home team) data 
    team_home = {}
    team_home.team_name = data.game.home_team_code 
    //getting team-2 (away team) data
    team_away = {}
    team_away.team_name = data.game.away_team_code
    team_one = []
    team_two = []
    n1=[]
    r1=[]
    c1=[]
    id1 = []
    image1=[]
    n2=[]
    r2=[]
    c2=[]
    id2 = []
    image2=[]
    start = Number(req.body.startNumber)
    end = Number(req.body.lastNumber)
    data.game.home_team.players.forEach((player)=>{
        n1.push(player.name)
        r1.push(getRole(player.position))
        c1.push(player.cost/10)
        id1.push(start)
        if(player.image ==null || player.image=='')
        {
            image1.push(default_image)
        }
        else{
            image1.push(player.image)
        }
        start++;
    })
    //second team 

    data.game.away_team.players.forEach((player)=>{
        n2.push(player.name)
        r2.push(getRole(player.position))
        c2.push(player.cost/10)
        id2.push(end)
        if(player.image ==null || player.image=='')
        {
            image2.push(default_image)
        }
        else{
            image2.push(player.image)
        }
        end++;
    })

    team_home.players_name = n1
    team_home.players_credits = c1
    team_home.players_role = r1
    team_home.players_image = image1 
    team_home.players_id = id1

    team_away.players_name = n2
    team_away.players_credits = c2
    team_away.players_role = r2
    team_away.players_image = image2
    team_away.players_id = id2

    series_data.teams =[team_home,team_away]

    res.send({
        data: series_data
    })
})



app.listen(process.env.PORT || 3500,()=>{
    console.log('server is up and running!')
})