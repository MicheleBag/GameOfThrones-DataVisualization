    
    <html>
    <head>
        <title>GoT-Data Visualization</title>
    </head>
    <style>
        div {font-family: Arial, Helvetica, sans-serif;}
        .line{
            position:relative;
            margin-top:-4%;
            margin-left: 40%;
            margin-right: 40%;
            height:3px;
            z-index:-1;
        }
        .blue{ background:blue;}
        .red{ background:#ff0000;}
        .pink{ background:pink;}
        .violet{ background: violet;}
        .green{ background:green;}

        h3{ margin: auto;}
    </style>
    <body>
        <div>
            <div id="svg_container" style="width: 80%; float:left; border: solid; box-sizing: border-box;">
                <svg width="80%" height="100"></svg>
            </div>
            <div style="width: 20%; float:right;" class="filter_options">
                <div style="margin-left: 3%;" class="filter_optrions">
                    <h1>Filter options</h1>
                    <hr>

                    <h3>Nodes charge</h3>
                    <input type="range" min="0" max="5000" value="500" class="charge" name="charge">
                    <hr>

                    <h3>Relations</h3>
                    <input class="filter_relation" value="family" type="checkbox" name="checkbtn_rel" >Family<div class="line blue">&nbsp;</div></input><br>
                    <input class="filter_relation" value="killed" type="checkbox" name="checkbtn_rel" >Killed<div class="line red">&nbsp;</div></input><br>
                    <input class="filter_relation" value="spouse" type="checkbox" name="checkbtn_rel" >Spouse<div class="line pink">&nbsp;</div></input><br>
                    <input class="filter_relation" value="lover" type="checkbox" name="checkbtn_rel" >Lover<div class="line violet">&nbsp;</div></input><br>
                    <input class="filter_relation" value="allegiance" type="checkbox" name="checkbtn_rel" >Allegiance<div class="line green">&nbsp;</div></input><br>
                    <hr>
                    <h3>Houses</h3>
                    <div style="width: 50%; float:left" class="filter_options">
                        <input class="filter_house" value="House Arryn" type="checkbox" name="checkbtn_nodes" >Arryn</input><br>
                        <input class="filter_house" value="House Baelish" type="checkbox" name="checkbtn_nodes" >Baelish</input><br>
                        <input class="filter_house" value="House Baratheon" type="checkbox" name="checkbtn_nodes" >Baratheon</input><br>
                        <input class="filter_house" value="House Bolton" type="checkbox" name="checkbtn_nodes" >Bolton</input><br>
                        <input class="filter_house" value="House Clegane" type="checkbox" name="checkbtn_nodes" >Clegane</input><br>
                        <input class="filter_house" value="House Dayne" type="checkbox" name="checkbtn_nodes" >Dayne</input><br>
                        <input class="filter_house" value="House Dondarrion" type="checkbox" name="checkbtn_nodes" >Dondarrion</input><br>
                        <input class="filter_house" value="House Frey" type="checkbox" name="checkbtn_nodes" >Frey</input><br>
                        <input class="filter_house" value="House Greyjoy" type="checkbox" name="checkbtn_nodes" >Greyjoy</input><br>
                        <input class="filter_house" value="House Lannister" type="checkbox" name="checkbtn_nodes" >Lannister</input><br>
                        <input class="filter_house" value="House Martell" type="checkbox" name="checkbtn_nodes" >Martell</input><br>
                        <input class="filter_house" value="House Mormont" type="checkbox" name="checkbtn_nodes" >Mormont</input><br>
                        <input class="filter_house" value="House Payne" type="checkbox" name="checkbtn_nodes" >Payne</input><br>
                    </div>
                    <div style="width: 50%; float:right" class="filter_options">
                        <input class="filter_house" value="House Redwyne" type="checkbox" name="checkbtn_nodes" >Redwyne</input><br>
                        <input class="filter_house" value="House Reed" type="checkbox" name="checkbtn_nodes" >Reed</input><br>
                        <input class="filter_house" value="House Stark" type="checkbox" name="checkbtn_nodes" >Stark</input><br>
                        <input class="filter_house" value="House Targaryen" type="checkbox" name="checkbtn_nodes" >Targaryen</input><br>
                        <input class="filter_house" value="House Tarth" type="checkbox" name="checkbtn_nodes" >Tarth</input><br>
                        <input class="filter_house" value="House Thorne" type="checkbox" name="checkbtn_nodes" >Thorne</input><br>
                        <input class="filter_house" value="House Tully" type="checkbox" name="checkbtn_nodes" >Tully</input><br>
                        <input class="filter_house" value="House Tyrell" type="checkbox" name="checkbtn_nodes" >Tyrell</input><br>
                        <input class="filter_house" value="Night's Watch" type="checkbox" name="checkbtn_nodes" >Night's Watch</input><br>
                        <input class="filter_house" value="Sand Snakes" type="checkbox" name="checkbtn_nodes" >Sand Snakes</input><br>
                        <input class="filter_house" value="Free Folk" type="checkbox" name="checkbtn_nodes" >Free Folk</input><br>
                        <input class="filter_house" value="undefined" type="checkbox" name="checkbtn_nodes" >Without house</input><br>
                    </div>
                </div>

            </div>
        </div>

        <!-- include d3 -->
        <script src="https://d3js.org/d3.v4.min.js"></script>
        <!-- Include our script -->
        <script type="text/javascript" src="chart.js"></script>
    </body>
    </html>

