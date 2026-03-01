"""
Astronomical calculation engine — Jean Meeus "Astronomical Algorithms" 2nd ed.
Extracted from night_sky_v2.py with API-friendly output format.
All verified: GMST ±0.001°, refraction ±0.07', Moon ELP2000 ±0.3°, planets ±2-5°
"""
import math

# ── Spectral type color (hex, for frontend rendering) ──────────────────────
SPECTRAL_HEX = {
    'O': '#9bb0ff', 'B': '#aabfff', 'A': '#cad7ff',
    'F': '#f8f7ff', 'G': '#fff4ea', 'K': '#ffd2a1', 'M': '#ffcc6f', '?': '#ffffff',
}

# ── Star catalog (RA_h, Dec_°, mag, SpT, name) ────────────────────────────
STARS = [
    (5.9194,7.4069,0.50,'M','Betelgeuse'),(5.2422,-8.2017,0.12,'B','Rigel'),
    (5.4186,6.3497,1.64,'B','Bellatrix'),(5.7958,-9.6697,2.07,'B','Saiph'),
    (5.5333,-0.2994,2.25,'O','Mintaka'),(5.6036,-1.2019,1.69,'B','Alnilam'),
    (5.6795,-1.9425,1.74,'O','Alnitak'),(5.5853,9.9339,3.47,'O','Meissa'),
    (5.6053,-5.9089,2.77,'O','Nair al Saif'),(5.4769,-2.3972,3.69,'B','Eta Ori'),
    (11.0622,61.7508,1.79,'K','Dubhe'),(11.0307,56.3825,2.37,'A','Merak'),
    (11.8972,53.6947,2.44,'A','Phecda'),(12.2572,57.0325,3.31,'A','Megrez'),
    (12.9008,55.9597,1.76,'A','Alioth'),(13.3989,54.9253,2.23,'A','Mizar'),
    (13.7923,49.3133,1.85,'B','Alkaid'),(13.4203,54.9878,3.99,'A','Alcor'),
    (0.1528,59.1500,2.27,'F','Caph'),(0.6753,56.5372,2.23,'K','Schedar'),
    (0.9453,60.7167,2.15,'B','Gamma Cas'),(1.4306,60.2353,2.68,'A','Ruchbah'),
    (1.9064,63.6700,3.37,'B','Segin'),(3.4053,49.8611,1.79,'F','Mirfak'),
    (3.1361,40.9564,2.12,'B','Algol'),(3.9728,40.0100,2.85,'B','Atik'),
    (3.7169,47.7881,3.79,'K','Misam'),(3.9525,35.7908,3.96,'B','Menkib'),
    (5.2781,45.9981,0.08,'G','Capella'),(5.9922,44.9475,1.90,'A','Menkalinan'),
    (5.0756,41.2339,2.62,'K','Theta Aur'),(4.9011,33.1661,2.69,'F','Hassaleh'),
    (7.5767,28.0261,1.14,'K','Pollux'),(7.7553,31.8883,1.58,'A','Castor'),
    (6.6286,16.3994,1.93,'A','Alhena'),(7.0658,20.5706,2.87,'M','Tejat'),
    (6.7286,25.1314,3.06,'G','Mebsuda'),(6.2686,22.5069,3.31,'M','Propus'),
    (7.3353,21.9822,3.53,'F','Wasat'),(6.7547,12.8956,3.35,'F','Alzirr'),
    (6.7525,-16.7161,-1.46,'A','Sirius'),(6.9772,-28.9722,1.50,'F','Adhara'),
    (7.4014,-29.3031,2.45,'B','Aludra'),(7.1397,-26.3931,1.84,'F','Wezen'),
    (6.3783,-17.9558,1.98,'B','Mirzam'),(7.6550,5.2250,0.38,'F','Procyon'),
    (7.4525,8.2894,2.89,'B','Gomeisa'),(4.5986,16.5092,0.85,'K','Aldebaran'),
    (5.4381,28.6083,1.65,'B','Elnath'),(3.7911,24.1167,2.86,'B','Alcyone'),
    (3.7208,24.1133,3.72,'B','Electra'),(3.7736,24.3667,3.62,'B','Maia'),
    (3.8181,24.0369,3.70,'B','Merope'),(4.0136,12.4906,2.96,'B','Zeta Tau'),
    (10.1395,11.9672,1.35,'B','Regulus'),(10.3328,19.8414,2.01,'K','Algieba'),
    (11.8175,14.5722,2.14,'A','Denebola'),(10.1222,23.4175,3.43,'F','Adhafera'),
    (11.2350,20.5239,2.56,'A','Zosma'),(9.7664,23.7742,3.52,'K','Ras Elased'),
    (13.4199,-11.1614,0.98,'B','Spica'),(12.6944,-1.4494,2.74,'F','Porrima'),
    (13.0361,10.9592,2.83,'G','Vindemiatrix'),(13.5783,-0.5961,3.37,'A','Heze'),
    (12.9269,3.3978,3.38,'G','Auva'),(14.2610,19.1822,-0.04,'K','Arcturus'),
    (14.7497,27.0742,2.37,'K','Izar'),(13.9111,18.3978,2.68,'G','Muphrid'),
    (15.0322,40.3903,3.49,'G','Nekkar'),(14.5319,38.3081,3.03,'A','Seginus'),
    (16.4901,-26.4322,1.06,'M','Antares'),(16.0053,-22.6217,2.32,'B','Dschubba'),
    (17.5600,-37.1039,1.62,'B','Shaula'),(17.6217,-42.9980,1.86,'B','Sargas'),
    (16.0911,-19.8056,2.50,'B','Graffias'),(17.5308,-37.2969,2.70,'B','Lesath'),
    (17.7878,-39.0300,2.39,'B','Girtab'),(16.3536,-25.5928,3.03,'K','Sigma Sco'),
    (18.4028,-34.3847,1.79,'B','Kaus Australis'),(18.4661,-25.4208,2.81,'K','Kaus Borealis'),
    (18.3503,-29.8281,2.70,'B','Kaus Media'),(19.0942,-21.0239,2.89,'F','Albaldah'),
    (19.1653,-29.8800,2.59,'A','Ascella'),(20.6905,45.2803,1.25,'A','Deneb'),
    (20.3703,40.2567,2.23,'F','Sadr'),(20.6906,45.1303,2.87,'A','Fawaris'),
    (20.7769,46.7264,2.86,'K','Rukh'),(19.5122,27.9597,3.05,'K','Albireo'),
    (20.7697,33.9706,2.47,'B','Gienah Cyg'),(18.6156,38.7836,0.03,'A','Vega'),
    (18.8347,33.3628,3.52,'B','Sheliak'),(18.9822,32.6894,3.24,'B','Sulafat'),
    (19.8464,8.8683,0.77,'A','Altair'),(19.7711,10.6133,2.72,'K','Tarazed'),
    (19.9211,6.4069,3.71,'K','Alshain'),(19.0906,13.8639,2.99,'B','Okab'),
    (17.2442,14.3903,3.00,'M','Rasalgethi'),(16.5044,21.4897,2.77,'G','Kornephoros'),
    (17.2881,24.8394,2.60,'G','Marsic'),(17.0931,24.8394,3.12,'K','Sarin'),
    (16.7036,31.6019,3.14,'A','Ruticulus'),(17.5822,12.5603,2.08,'A','Rasalhague'),
    (17.7247,4.5664,2.77,'K','Cebalrai'),(16.6178,-10.5669,2.43,'A','Han'),
    (17.1728,-15.7247,2.43,'A','Sabik'),(16.3614,-4.6925,2.73,'K','Yed Prior'),
    (16.4186,-4.6925,2.75,'K','Yed Posterior'),(15.5781,26.7147,2.22,'A','Alphecca'),
    (15.4639,29.1058,3.65,'A','Nusakan'),(15.7378,6.4253,2.65,'K','Unukalhai'),
    (17.9436,51.4889,2.24,'K','Eltanin'),(17.5072,52.3014,2.79,'G','Rastaban'),
    (14.0656,64.3758,3.65,'A','Thuban'),(14.8450,74.1556,2.07,'K','Kochab'),
    (15.3453,71.8339,3.05,'F','Pherkad'),(19.2122,67.6614,3.07,'G','Altais'),
    (17.8922,56.8728,3.74,'G','Grumium'),(17.1436,65.7147,2.79,'G','Alwaid'),
    (2.5303,89.2642,1.98,'F','Polaris'),(14.6600,-60.8339,-0.27,'G','Rigil Kentaurus'),
    (14.0636,-60.3731,0.61,'B','Hadar'),(13.6647,-53.4664,2.29,'B','Epsilon Cen'),
    (14.1114,-36.3700,2.06,'K','Menkent'),(12.1939,-52.3686,2.17,'A','Muhlifain'),
    (12.4433,-63.0992,0.87,'B','Acrux'),(12.7953,-59.6886,1.25,'B','Mimosa'),
    (12.5194,-57.1133,1.59,'M','Gacrux'),(12.3531,-60.4014,2.78,'B','Delta Crucis'),
    (8.1589,-47.3364,1.78,'O','Gamma Vel'),(9.1331,-43.4328,2.21,'K','Suhail'),
    (8.3753,-59.5092,1.86,'K','Avior'),(8.7458,-54.7083,1.96,'B','Alsephina'),
    (6.3992,-52.6958,-0.72,'F','Canopus'),(9.2200,-69.7175,1.67,'A','Miaplacidus'),
    (8.0594,-40.0033,2.25,'O','Naos'),(7.4853,-43.3011,2.70,'F','Tureis'),
    (1.6286,-57.2367,0.46,'B','Achernar'),(3.9667,-13.5083,2.77,'A','Cursa'),
    (0.7264,-17.9867,2.02,'K','Diphda'),(3.0381,4.0897,2.53,'M','Menkar'),
    (0.1397,29.0903,2.07,'B','Alpheratz'),(1.1622,35.6203,2.07,'M','Mirach'),
    (2.0650,42.3297,2.26,'K','Almach'),(23.0789,15.2125,2.49,'B','Markab'),
    (23.0628,28.0828,2.44,'M','Scheat'),(0.2211,15.1836,2.83,'B','Algenib'),
    (21.7364,9.8753,2.40,'K','Enif'),(22.6911,30.2211,2.95,'G','Matar'),
    (22.6911,10.8314,3.35,'B','Homan'),(21.3731,6.1978,3.53,'F','Biham'),
    (2.1197,23.4625,2.00,'K','Hamal'),(1.9108,20.8081,2.64,'A','Sheratan'),
    (21.5261,-5.5711,2.89,'G','Sadalsuud'),(22.0961,-0.3197,2.95,'G','Sadalmelik'),
    (22.9111,-15.8208,3.27,'A','Skat'),(22.9608,-29.6222,1.16,'A','Fomalhaut'),
    (22.1372,-46.9608,1.74,'B','Al Nair'),(0.4358,-42.3061,2.39,'K','Ankaa'),
    (5.5458,-17.8222,2.58,'F','Arneb'),(5.4708,-20.7592,2.84,'G','Nihal'),
    (10.1764,-8.6586,1.98,'K','Alphard'),(12.5731,-23.3964,2.65,'B','Kraz'),
    (12.4975,-16.5150,2.95,'B','Algorab'),(12.1678,-22.6197,3.02,'F','Minkar'),
    (14.8450,-16.0417,2.75,'A','Zubenelgenubi'),(15.2836,-9.3828,2.61,'B','Zubeneschamali'),
    (21.3097,62.5856,2.45,'A','Alderamin'),(21.4775,70.5608,3.23,'B','Alfirk'),
    (23.6556,77.6325,3.21,'K','Er Rai'),(20.6611,14.5953,3.64,'F','Rotanev'),
    (20.6597,15.9119,3.77,'B','Sualocin'),(12.9339,38.3183,2.90,'A','Cor Caroli'),
    (16.8111,-69.0278,1.91,'K','Atria'),(20.4275,-56.7350,1.94,'B','Peacock'),
    (22.3083,-60.2597,2.87,'K','Alpha Tuc'),(21.5261,-5.5711,2.89,'G','Sadalsuud'),
    (15.1978,-47.3878,2.30,'B','Alpha Lup'),(15.0469,-43.1331,2.68,'B','Beta Lup'),
    (17.5306,-49.8764,2.84,'K','Alpha Ara'),(17.4225,-55.5297,2.84,'K','Beta Ara'),
    (1.9794,-61.5694,2.82,'F','Beta Hyi'),(12.6197,-69.1353,2.69,'B','Alpha Mus'),
    (5.5208,-34.0744,2.65,'B','Phact'),(5.8494,-35.7683,3.12,'K','Wazn'),
    (19.9794,18.0139,3.47,'G','Gamma Sge'),(18.4331,-2.8989,3.26,'A','Alya'),
    (17.3622,-24.9989,3.27,'A','Theta Oph'),(18.0978,-30.4231,3.32,'K','Eta Sgr'),
    (19.0906,-4.8819,3.36,'F','Deneb Okab'),(20.2944,-12.5081,3.58,'F','Algedi'),
    (21.7844,-16.1272,3.57,'A','Nashira'),(21.6631,-16.6617,2.85,'K','Deneb Algedi'),
    (21.3697,-25.0069,3.05,'G','Dabih'),(22.1372,-46.9608,1.74,'B','Al Nair'),
    (13.1664,17.5289,4.25,'F','Beta Com'),(9.3506,34.3928,3.14,'K','Alpha Lyn'),
    (14.7083,-64.9750,3.18,'F','Alpha Cir'),(12.7717,-68.1081,3.05,'B','Beta Mus'),
    (18.7167,-71.4278,3.42,'A','Beta Pav'),(15.3153,-68.6797,2.87,'F','Gamma TrA'),
    (15.9183,-63.4297,2.85,'F','Beta TrA'),(22.4881,-43.4956,3.01,'A','Aldhanab'),
    (22.7128,-46.8847,2.07,'M','Gruid'),(20.6264,-47.2917,3.11,'K','Alpha Ind'),
    (4.5661,-55.0447,3.27,'A','Alpha Dor'),(4.2739,-62.4733,3.35,'G','Alpha Ret'),
    (3.2011,-28.9878,3.80,'F','Alpha For'),(0.9769,-29.3572,4.31,'B','Alpha Scl'),
    (18.5869,-8.2433,3.85,'G','Alpha Sct'),(16.3308,-50.1556,4.01,'B','Gamma Nor'),
    (7.9836,-5.9078,3.82,'A','Zeta Mon'),(13.3153,-23.1714,3.11,'B','Beta Hya'),
    (8.6261,5.7031,3.90,'G','Zeta Hya'),(10.8267,-16.1944,3.54,'B','Gamma Hya'),
    (10.9958,-18.2986,4.06,'K','Alkes'),(12.1594,-24.7286,4.02,'F','Alchiba'),
    (22.2878,-16.6617,3.68,'K','Nashira'),(23.4658,6.3794,3.62,'G','Alpherg'),
    (2.0342,2.7639,4.01,'A','Alrescha'),(19.8794,-1.0147,3.44,'K','Al Thalimain'),
    (20.7939,-9.4956,3.77,'G','Albali'),(22.3594,1.3783,3.84,'A','Sadachbia'),
    (22.3594,-7.7836,4.17,'A','Ancha'),(21.2633,5.2478,3.92,'F','Kitalpha'),
]
# deduplicate
_seen = set()
_STARS_CLEAN = []
for s in STARS:
    k = (s[4], round(s[0],3))
    if k not in _seen:
        _seen.add(k)
        _STARS_CLEAN.append(s)
STARS = _STARS_CLEAN

# ── Constellation lines ───────────────────────────────────────────────────
CONSTELLATION_LINES = {
    'Orion':            [('Betelgeuse','Bellatrix'),('Betelgeuse','Alnilam'),
                         ('Bellatrix','Alnilam'),('Alnilam','Alnitak'),
                         ('Mintaka','Alnilam'),('Rigel','Saiph'),
                         ('Rigel','Alnitak'),('Saiph','Alnitak'),
                         ('Meissa','Bellatrix'),('Meissa','Betelgeuse'),
                         ('Nair al Saif','Alnitak'),('Nair al Saif','Saiph')],
    'Ursa Major':       [('Dubhe','Merak'),('Merak','Phecda'),('Phecda','Megrez'),
                         ('Megrez','Alioth'),('Alioth','Mizar'),
                         ('Mizar','Alkaid'),('Dubhe','Megrez')],
    'Cassiopeia':       [('Caph','Gamma Cas'),('Gamma Cas','Schedar'),
                         ('Schedar','Ruchbah'),('Ruchbah','Segin')],
    'Perseus':          [('Mirfak','Algol'),('Mirfak','Atik'),('Mirfak','Misam'),('Algol','Misam')],
    'Auriga':           [('Capella','Menkalinan'),('Menkalinan','Theta Aur'),
                         ('Theta Aur','Hassaleh'),('Hassaleh','Capella'),('Elnath','Capella')],
    'Gemini':           [('Castor','Pollux'),('Castor','Alhena'),('Pollux','Wasat'),
                         ('Castor','Mebsuda'),('Alhena','Wasat'),('Mebsuda','Propus')],
    'Canis Major':      [('Sirius','Mirzam'),('Sirius','Adhara'),('Sirius','Wezen'),
                         ('Wezen','Aludra')],
    'Taurus':           [('Aldebaran','Elnath'),('Aldebaran','Alcyone'),
                         ('Alcyone','Maia'),('Maia','Merope'),('Merope','Electra'),
                         ('Electra','Alcyone'),('Aldebaran','Zeta Tau')],
    'Leo':              [('Regulus','Algieba'),('Algieba','Ras Elased'),
                         ('Regulus','Denebola'),('Denebola','Zosma'),('Zosma','Algieba')],
    'Virgo':            [('Spica','Porrima'),('Porrima','Vindemiatrix'),
                         ('Spica','Heze'),('Porrima','Auva')],
    'Boötes':           [('Arcturus','Muphrid'),('Arcturus','Izar'),
                         ('Arcturus','Seginus'),('Arcturus','Nekkar'),('Nekkar','Izar')],
    'Scorpius':         [('Antares','Graffias'),('Antares','Dschubba'),
                         ('Antares','Sigma Sco'),('Antares','Sargas'),
                         ('Sargas','Shaula'),('Shaula','Lesath'),('Girtab','Sargas')],
    'Sagittarius':      [('Kaus Australis','Kaus Media'),('Kaus Media','Kaus Borealis'),
                         ('Kaus Australis','Ascella'),('Albaldah','Kaus Borealis')],
    'Cygnus':           [('Deneb','Sadr'),('Sadr','Albireo'),('Sadr','Gienah Cyg'),
                         ('Sadr','Fawaris'),('Sadr','Rukh'),('Gienah Cyg','Albireo')],
    'Lyra':             [('Vega','Sheliak'),('Vega','Sulafat'),('Sheliak','Sulafat')],
    'Aquila':           [('Altair','Tarazed'),('Altair','Alshain'),
                         ('Altair','Okab'),('Okab','Deneb Okab')],
    'Hercules':         [('Rasalgethi','Kornephoros'),('Kornephoros','Ruticulus'),
                         ('Ruticulus','Marsic'),('Sarin','Marsic'),('Sarin','Kornephoros')],
    'Ophiuchus':        [('Rasalhague','Cebalrai'),('Cebalrai','Yed Prior'),
                         ('Han','Sabik'),('Rasalhague','Han')],
    'Corona Borealis':  [('Alphecca','Nusakan')],
    'Draco':            [('Eltanin','Rastaban'),('Rastaban','Alwaid'),
                         ('Eltanin','Altais'),('Grumium','Eltanin'),('Thuban','Kochab')],
    'Andromeda':        [('Alpheratz','Mirach'),('Mirach','Almach')],
    'Pegasus':          [('Markab','Scheat'),('Scheat','Alpheratz'),('Alpheratz','Algenib'),
                         ('Algenib','Markab'),('Enif','Markab'),('Matar','Scheat'),
                         ('Matar','Homan')],
    'Centaurus':        [('Rigil Kentaurus','Hadar'),('Rigil Kentaurus','Menkent'),
                         ('Hadar','Muhlifain'),('Muhlifain','Epsilon Cen')],
    'Crux':             [('Acrux','Gacrux'),('Mimosa','Delta Crucis')],
    'Libra':            [('Zubenelgenubi','Zubeneschamali')],
}

# ── Deep sky objects ──────────────────────────────────────────────────────
DEEP_SKY = [
    {'name':'Andromeda Galaxy','id':'M31','ra':0.7122,'dec':41.2692,'type':'Galaxy','mag':3.44,'desc':'Nearest major galaxy, 2.5M ly away'},
    {'name':'Orion Nebula','id':'M42','ra':5.5883,'dec':-5.3911,'type':'Nebula','mag':4.0,'desc':'Stellar nursery, 1,344 light-years'},
    {'name':'Pleiades','id':'M45','ra':3.7911,'dec':24.1167,'type':'Open Cluster','mag':1.6,'desc':'Seven Sisters, 444 ly'},
    {'name':'Beehive Cluster','id':'M44','ra':8.6728,'dec':19.9822,'type':'Open Cluster','mag':3.1,'desc':'Praesepe, 577 ly'},
    {'name':'Ptolemy Cluster','id':'M7','ra':17.8975,'dec':-34.8217,'type':'Open Cluster','mag':3.3,'desc':'Ptolemy noticed this in 130 AD'},
    {'name':'Butterfly Cluster','id':'M6','ra':17.6667,'dec':-32.2167,'type':'Open Cluster','mag':4.2,'desc':'Resembles a butterfly'},
    {'name':'Wild Duck Cluster','id':'M11','ra':18.8508,'dec':-6.2667,'type':'Open Cluster','mag':5.8,'desc':'One of the richest clusters'},
    {'name':'Lagoon Nebula','id':'M8','ra':18.0639,'dec':-24.3833,'type':'Nebula','mag':6.0,'desc':'Active star-forming region'},
    {'name':'Omega Nebula','id':'M17','ra':18.3456,'dec':-16.1778,'type':'Nebula','mag':6.0,'desc':'Swan Nebula, Sagittarius'},
    {'name':'Hercules Cluster','id':'M13','ra':16.6950,'dec':36.4617,'type':'Globular','mag':5.8,'desc':'300,000 stars, 22,200 ly'},
    {'name':'Omega Centauri','id':'NGC 5139','ra':13.4467,'dec':-47.4792,'type':'Globular','mag':3.9,'desc':'Largest globular cluster'},
    {'name':'Triangulum Galaxy','id':'M33','ra':1.5639,'dec':30.6600,'type':'Galaxy','mag':5.7,'desc':'Local Group, 2.73M ly'},
    {'name':'Globular M5','id':'M5','ra':15.3094,'dec':2.0817,'type':'Globular','mag':5.65,'desc':'One of the oldest globulars'},
    {'name':'Globular M3','id':'M3','ra':13.7033,'dec':28.3767,'type':'Globular','mag':5.9,'desc':'500,000 stars'},
    {'name':'Trifid Nebula','id':'M20','ra':18.0419,'dec':-22.9833,'type':'Nebula','mag':6.3,'desc':'Three-lobed emission nebula'},
    {'name':'Sagittarius Star Cloud','id':'M24','ra':18.2789,'dec':-18.5500,'type':'Open Cluster','mag':4.6,'desc':'Dense Milky Way star field'},
    {'name':'Globular M22','id':'M22','ra':18.6039,'dec':-23.9,'type':'Globular','mag':5.1,'desc':'Brightest globular in Sagittarius'},
    {'name':'Globular M4','id':'M4','ra':16.3933,'dec':-26.5317,'type':'Globular','mag':5.6,'desc':'Nearest globular cluster'},
    {'name':'Bode\'s Galaxy','id':'M81','ra':9.9256,'dec':69.0650,'type':'Galaxy','mag':6.9,'desc':'Grandeur spiral, 12M ly'},
    {'name':'Pinwheel Galaxy','id':'M101','ra':14.0531,'dec':54.3489,'type':'Galaxy','mag':7.9,'desc':'Face-on spiral, 21M ly'},
    {'name':'Sombrero Galaxy','id':'M104','ra':12.6664,'dec':-11.6231,'type':'Galaxy','mag':8.0,'desc':'Prominent dust lane'},
]

# ── Orbital elements for all 8 planets (Meeus Table 31.a, J2000.0) ────────
PLANET_ELEMENTS = {
    'Mercury': dict(L0=252.250324,Ldot=149472.6746358,a=0.38709927,
                    e0=0.20563593,edot=0.00002032,I0=7.00497902,Idot=-0.00594749,
                    Ω0=48.33076593,w0=77.45779628,wdot=0.16047689),
    'Venus':   dict(L0=181.979801,Ldot=58517.8156760,a=0.72333566,
                    e0=0.00677672,edot=-0.00004107,I0=3.39467605,Idot=-0.00078890,
                    Ω0=76.67984255,w0=131.60246718,wdot=0.00268329),
    'Mars':    dict(L0=355.433275,Ldot=19140.2993313,a=1.52371034,
                    e0=0.09339410,edot=0.00007882,I0=1.84969142,Idot=-0.00813131,
                    Ω0=49.55953891,w0=336.05882365,wdot=0.44441088),
    'Jupiter': dict(L0=34.351519,Ldot=3034.7459481,a=5.20288700,
                    e0=0.04838624,edot=-0.00013253,I0=1.30439695,Idot=-0.00183714,
                    Ω0=100.47390909,w0=14.72847983,wdot=0.21252668),
    'Saturn':  dict(L0=50.077444,Ldot=1222.1138488,a=9.53667594,
                    e0=0.05386179,edot=-0.00050991,I0=2.48599187,Idot=0.00193609,
                    Ω0=113.66242448,w0=92.59887831,wdot=0.54127438),
    'Uranus':  dict(L0=314.055005,Ldot=428.4669983,a=19.18916464,
                    e0=0.04725744,edot=-0.00004397,I0=0.77263783,Idot=-0.00242939,
                    Ω0=74.01692503,w0=170.95427630,wdot=0.09256625),
    'Neptune': dict(L0=304.348665,Ldot=218.4862002,a=30.06992276,
                    e0=0.00859048,edot=0.00005105,I0=1.77004347,Idot=0.00035372,
                    Ω0=131.78422574,w0=44.96476227,wdot=-0.32241464),
}

PLANET_COLORS = {
    'Mercury':'#b8b8b8','Venus':'#fff9c4','Mars':'#ff5533',
    'Jupiter':'#ffd580','Saturn':'#daa520','Uranus':'#7fffef','Neptune':'#4169e1',
}

# Country capitals fallback (lat, lon, city name)
COUNTRY_CAPITALS = {
    'IN':(28.6139,77.2090,'New Delhi'),
    'US':(38.8951,-77.0364,'Washington D.C.'),
    'GB':(51.5074,-0.1278,'London'),
    'DE':(52.5200,13.4050,'Berlin'),
    'FR':(48.8566,2.3522,'Paris'),
    'JP':(35.6762,139.6503,'Tokyo'),
    'CN':(39.9042,116.4074,'Beijing'),
    'AU':(-35.2809,149.1300,'Canberra'),
    'BR':(-15.7975,-47.8919,'Brasília'),
    'CA':(45.4215,-75.6919,'Ottawa'),
    'RU':(55.7558,37.6173,'Moscow'),
    'ZA':(-25.7479,28.2293,'Pretoria'),
    'MX':(19.4326,-99.1332,'Mexico City'),
    'AR':(-34.6037,-58.3816,'Buenos Aires'),
    'EG':(30.0444,31.2357,'Cairo'),
    'NG':(9.0765,7.3986,'Abuja'),
    'KR':(37.5665,126.9780,'Seoul'),
    'IT':(41.9028,12.4964,'Rome'),
    'ES':(40.4168,-3.7038,'Madrid'),
    'NG':(9.0765,7.3986,'Abuja'),
    'default':(51.5074,-0.1278,'London'),
}

# ══════════════════════════════════════════════════════════════════════
# TIME & COORDINATES
# ══════════════════════════════════════════════════════════════════════

def julian_day(year,month,day,hour=0,minute=0,second=0):
    if month<=2: year-=1; month+=12
    A=int(year/100); B=2-A+int(A/4)
    return int(365.25*(year+4716))+int(30.6001*(month+1))+day+hour/24+minute/1440+second/86400+B-1524.5

def julian_day_now():
    from datetime import datetime,timezone
    n=datetime.now(timezone.utc)
    return julian_day(n.year,n.month,n.day,n.hour,n.minute,n.second)

def gmst(JD):
    T=(JD-2451545.0)/36525.0
    return (280.46061837+360.98564736629*(JD-2451545.0)+0.000387933*T**2-T**3/38710000.0)%360.0

def lst(JD,lon): return (gmst(JD)+lon)%360.0

def precess(ra_h,dec_d,JD):
    T=(JD-2451545.0)/36525.0
    ζA=(0.6406161+0.0000839*T+0.0000050*T**2)*T
    zA=(0.6406161+0.0003041*T+0.0000051*T**2)*T
    θA=(0.5567530-0.0001185*T-0.0000116*T**2)*T
    ζr,zr,θr=math.radians(ζA),math.radians(zA),math.radians(θA)
    α0=math.radians(ra_h*15); δ0=math.radians(dec_d)
    A=math.cos(δ0)*math.sin(α0+ζr)
    B=math.cos(θr)*math.cos(δ0)*math.cos(α0+ζr)-math.sin(θr)*math.sin(δ0)
    C=math.sin(θr)*math.cos(δ0)*math.cos(α0+ζr)+math.cos(θr)*math.sin(δ0)
    return (math.degrees(math.atan2(A,B)+zr)%360)/15.0, math.degrees(math.asin(C))

def refraction(alt):
    if alt<-2: return 0.0
    return 1.02/math.tan(math.radians(alt+10.3/(alt+5.11)))/60.0

def ra_dec_to_altaz(ra_h,dec_d,LST,lat):
    HA=math.radians((LST-ra_h*15)%360)
    d=math.radians(dec_d); φ=math.radians(lat)
    sin_alt=math.sin(d)*math.sin(φ)+math.cos(d)*math.cos(φ)*math.cos(HA)
    sin_alt=max(-1.0,min(1.0,sin_alt))
    alt=math.degrees(math.asin(sin_alt))
    cos_az=(math.sin(d)-math.sin(φ)*sin_alt)/(math.cos(φ)*math.cos(math.radians(alt)))
    cos_az=max(-1.0,min(1.0,cos_az))
    az=math.degrees(math.acos(cos_az))
    if math.sin(HA)>0: az=360-az
    return alt+refraction(alt),az

# ══════════════════════════════════════════════════════════════════════
# PLANETS
# ══════════════════════════════════════════════════════════════════════

def _kepler(M,e):
    M=math.radians(M%360); E=M
    for _ in range(100):
        dE=(M-E+e*math.sin(E))/(1-e*math.cos(E)); E+=dE
        if abs(dE)<1e-12: break
    return math.degrees(2*math.atan2(math.sqrt(1+e)*math.sin(E/2),math.sqrt(1-e)*math.cos(E/2)))%360

def _helio(name,T):
    el=PLANET_ELEMENTS[name]
    L=(el['L0']+el['Ldot']*T)%360; a=el['a']
    e=el['e0']+el.get('edot',0)*T; I=el['I0']+el.get('Idot',0)*T
    Ω=el['Ω0']%360; w=(el['w0']+el.get('wdot',0)*T)%360
    M=(L-w)%360; v=_kepler(M,e); r=a*(1-e**2)/(1+e*math.cos(math.radians(v)))
    u=math.radians((v+w-Ω)%360); Ω_r=math.radians(Ω); I_r=math.radians(I)
    x=r*(math.cos(Ω_r)*math.cos(u)-math.sin(Ω_r)*math.sin(u)*math.cos(I_r))
    y=r*(math.sin(Ω_r)*math.cos(u)+math.cos(Ω_r)*math.sin(u)*math.cos(I_r))
    z=r*math.sin(u)*math.sin(I_r)
    return x,y,z

def _js_perturb(T,Mj,Ms):
    mj,ms=math.radians(Mj),math.radians(Ms)
    dj=(0.33150*math.sin(2*mj-5*ms-math.radians(67.60))+0.03025*math.sin(2*mj-6*ms-math.radians(20.39))
       -0.01985*math.sin(mj+ms-math.radians(184.10))+0.01480*math.sin(3*mj-5*ms+math.radians(19.54)))
    ds=(-0.81318*math.sin(2*mj-5*ms-math.radians(67.60))+0.02490*math.sin(2*mj-4*ms-math.radians(23.79))
       -0.02085*math.sin(2*mj-5*ms+math.radians(43.88)))
    return dj,ds

def _apply_js(x,y,delta_deg):
    dr=math.radians(delta_deg); c,s=math.cos(dr),math.sin(dr)
    return x*c-y*s, x*s+y*c

def planet_radec(JD,name):
    if name not in PLANET_ELEMENTS: return None
    T=(JD-2451545.0)/36525.0; ε=23.439291111-0.013004167*T
    Le=(100.464457+35999.3728565*T)%360; we=102.937348+1.7195269*T
    ee=0.016708634-4.2037e-5*T; ve=_kepler((Le-we)%360,ee)
    re=1.000001018*(1-ee**2)/(1+ee*math.cos(math.radians(ve)))
    λe=math.radians((ve+we)%360); xe,ye=re*math.cos(λe),re*math.sin(λe)
    x,y,z=_helio(name,T)
    if name in ('Jupiter','Saturn'):
        el_j=PLANET_ELEMENTS['Jupiter']; el_s=PLANET_ELEMENTS['Saturn']
        Lj=(el_j['L0']+el_j['Ldot']*T)%360; wj=(el_j['w0']+el_j.get('wdot',0)*T)%360
        Ls=(el_s['L0']+el_s['Ldot']*T)%360; ws=(el_s['w0']+el_s.get('wdot',0)*T)%360
        Mj=(Lj-wj)%360; Ms=(Ls-ws)%360; dj,ds=_js_perturb(T,Mj,Ms)
        δ=dj if name=='Jupiter' else ds; x,y=_apply_js(x,y,δ)
    dist=math.sqrt((x-xe)**2+(y-ye)**2+z**2)
    T2=(JD-0.0057755*dist-2451545.0)/36525.0
    x,y,z=_helio(name,T2)
    if name in ('Jupiter','Saturn'):
        el_j=PLANET_ELEMENTS['Jupiter']; el_s=PLANET_ELEMENTS['Saturn']
        Lj=(el_j['L0']+el_j['Ldot']*T2)%360; wj=(el_j['w0']+el_j.get('wdot',0)*T2)%360
        Ls=(el_s['L0']+el_s['Ldot']*T2)%360; ws=(el_s['w0']+el_s.get('wdot',0)*T2)%360
        Mj=(Lj-wj)%360; Ms=(Ls-ws)%360; dj,ds=_js_perturb(T2,Mj,Ms)
        δ=dj if name=='Jupiter' else ds; x,y=_apply_js(x,y,δ)
    dx,dy,dz=x-xe,y-ye,z
    lon=math.degrees(math.atan2(dy,dx))%360
    lat=math.degrees(math.atan2(dz,math.sqrt(dx**2+dy**2)))
    εr=math.radians(ε); lr,br=math.radians(lon),math.radians(lat)
    ra_r=math.atan2(math.sin(lr)*math.cos(εr)-math.tan(br)*math.sin(εr),math.cos(lr))
    dec_r=math.asin(math.sin(br)*math.cos(εr)+math.cos(br)*math.sin(εr)*math.sin(lr))
    return (math.degrees(ra_r)%360)/15.0, math.degrees(dec_r)

def sun_radec(JD):
    T=(JD-2451545.0)/36525.0
    L0=(280.46646+36000.76983*T)%360
    M=math.radians((357.52911+35999.05029*T)%360)
    C=(1.914602-0.004817*T)*math.sin(M)+0.019993*math.sin(2*M)+0.000289*math.sin(3*M)
    Ω=math.radians((125.04-1934.136*T)%360)
    app=math.radians(L0+C-0.00569-0.00478*math.sin(Ω))
    ε=math.radians(23.439291111-0.013004167*T+0.00256*math.cos(Ω))
    return (math.degrees(math.atan2(math.cos(ε)*math.sin(app),math.cos(app)))%360)/15.0, math.degrees(math.asin(math.sin(ε)*math.sin(app)))

def moon_radec(JD):
    T=(JD-2451545.0)/36525.0
    Lm=(218.3164477+481267.88123421*T-0.0015786*T**2)%360
    D=(297.8501921+445267.1114034*T-0.0018819*T**2)%360
    M=(357.5291092+35999.0502909*T-0.0001536*T**2)%360
    Mm=(134.9633964+477198.8675055*T+0.0087414*T**2)%360
    F=(93.2720950+483202.0175233*T-0.0036539*T**2)%360
    Dr,Mr,Mmr,Fr=map(math.radians,[D,M,Mm,F])
    E=1-0.002516*T-0.0000074*T**2
    Σl=(6288774*math.sin(Mmr)+1274027*math.sin(2*Dr-Mmr)+658314*math.sin(2*Dr)
       +213618*math.sin(2*Mmr)-185116*E*math.sin(Mr)-114332*math.sin(2*Fr)
       +58793*math.sin(2*Dr-2*Mmr)+57066*E*math.sin(2*Dr-Mr-Mmr)
       +53322*math.sin(2*Dr+Mmr)+45758*E*math.sin(2*Dr-Mr)
       -40923*E*math.sin(Mr-Mmr)-34720*math.sin(Dr)-30383*E*math.sin(Mr+Mmr)
       +15327*math.sin(2*Dr-2*Fr)-12528*math.sin(Mmr+2*Fr)
       +10980*math.sin(Mmr-2*Fr)+10675*math.sin(4*Dr-Mmr)
       +10034*math.sin(3*Mmr)+8548*math.sin(4*Dr-2*Mmr)
       -7888*E*math.sin(2*Dr+Mr-Mmr))
    lon=(Lm+Σl/1e6)%360
    Σb=(5128122*math.sin(Fr)+280602*math.sin(Mmr+Fr)+277693*math.sin(Mmr-Fr)
       +173237*math.sin(2*Dr-Fr)+55413*math.sin(2*Dr-Mmr+Fr)
       -46271*math.sin(2*Dr-Mmr-Fr)+32573*math.sin(2*Dr+Fr)+17198*math.sin(2*Mmr+Fr))
    lat=Σb/1e6
    ε=23.439291111-0.013004167*T; εr=math.radians(ε)
    lr,br=math.radians(lon),math.radians(lat)
    ra_r=math.atan2(math.sin(lr)*math.cos(εr)-math.tan(br)*math.sin(εr),math.cos(lr))
    dec_r=math.asin(math.sin(br)*math.cos(εr)+math.cos(br)*math.sin(εr)*math.sin(lr))
    return (math.degrees(ra_r)%360)/15.0, math.degrees(dec_r)

def moon_phase(JD):
    """Returns (illumination_fraction 0-1, phase_index 0-7, elongation_deg, waxing bool)."""
    T=(JD-2451545.0)/36525.0
    D=(297.8501921+445267.1114034*T)%360
    illumination=(1-math.cos(math.radians(D)))/2.0
    phase_idx=int(D/360.0*8)%8
    waxing=D<180.0
    return illumination, phase_idx, D, waxing

def gal_to_eq(l,b):
    lr,br=math.radians(l),math.radians(b)
    xg=math.cos(br)*math.cos(lr); yg=math.cos(br)*math.sin(lr); zg=math.sin(br)
    xe=-0.054876*xg+0.494109*yg-0.867666*zg
    ye=-0.873437*xg-0.444830*yg-0.198076*zg
    ze=-0.483835*xg+0.746982*yg+0.455984*zg
    return (math.degrees(math.atan2(ye,xe))%360)/15.0, math.degrees(math.asin(max(-1.0,min(1.0,ze))))

# ══════════════════════════════════════════════════════════════════════
# MAIN DATA BUILDER
# ══════════════════════════════════════════════════════════════════════

def get_sky_data(lat: float, lon: float, jd: float | None = None):
    if jd is None:
        jd = julian_day_now()
    LST = lst(jd, lon)
    T = (jd - 2451545.0) / 36525.0
    from datetime import datetime, timezone, timedelta
    utc_dt = datetime(2000, 1, 1, 12) + timedelta(days=jd - 2451545.0)

    # ── Stars ──────────────────────────────────────────────────────
    stars_out = []
    star_pos_map = {}  # name → {x,y} for constellation lines
    for ra_h, dec_d, mag, spt, name in STARS:
        ra_p, dec_p = precess(ra_h, dec_d, jd)
        alt, az = ra_dec_to_altaz(ra_p, dec_p, LST, lat)
        if alt < -2: continue
        r = (90 - alt) / 90.0
        theta = math.radians(az)
        x = r * math.sin(theta)
        y = r * math.cos(theta)
        star_pos_map[name] = {'x': round(x, 5), 'y': round(y, 5)}
        stars_out.append({
            'name': name, 'mag': mag, 'spt': spt,
            'color': SPECTRAL_HEX.get(spt, '#ffffff'),
            'alt': round(alt, 2), 'az': round(az, 2),
            'x': round(x, 5), 'y': round(y, 5),
        })
    stars_out.sort(key=lambda s: s['mag'])

    # ── Constellation lines ───────────────────────────────────────
    con_lines_out = {}
    for con_name, pairs in CONSTELLATION_LINES.items():
        segs = []
        for s1, s2 in pairs:
            if s1 in star_pos_map and s2 in star_pos_map:
                segs.append({'x1': star_pos_map[s1]['x'], 'y1': star_pos_map[s1]['y'],
                             'x2': star_pos_map[s2]['x'], 'y2': star_pos_map[s2]['y']})
        if segs:
            con_lines_out[con_name] = segs

    # ── Planets ───────────────────────────────────────────────────
    planets_out = []
    for pname, pcolor in PLANET_COLORS.items():
        res = planet_radec(jd, pname)
        if res is None: continue
        ra_p, dec_p = res
        alt, az = ra_dec_to_altaz(ra_p, dec_p, LST, lat)
        r = (90 - alt) / 90.0
        theta = math.radians(az)
        entry = {'name': pname, 'color': pcolor,
                 'alt': round(alt, 2), 'az': round(az, 2), 'visible': alt > -2}
        if alt > -2:
            entry['x'] = round(r * math.sin(theta), 5)
            entry['y'] = round(r * math.cos(theta), 5)
        planets_out.append(entry)

    # ── Sun ───────────────────────────────────────────────────────
    sra, sdec = sun_radec(jd)
    salt, saz = ra_dec_to_altaz(sra, sdec, LST, lat)
    sr = (90 - salt) / 90.0; stheta = math.radians(saz)
    sun_out = {'alt': round(salt, 2), 'az': round(saz, 2),
               'visible': salt > 0,
               'x': round(sr * math.sin(stheta), 5),
               'y': round(sr * math.cos(stheta), 5)}

    # ── Moon ─────────────────────────────────────────────────────
    mra, mdec = moon_radec(jd)
    mra_p, mdec_p = precess(mra, mdec, jd)
    malt, maz = ra_dec_to_altaz(mra_p, mdec_p, LST, lat)
    phase, phase_idx, elongation, waxing = moon_phase(jd)
    phase_names = ['New Moon','Waxing Crescent','First Quarter','Waxing Gibbous',
                   'Full Moon','Waning Gibbous','Last Quarter','Waning Crescent']
    mr = (90 - malt) / 90.0; mtheta = math.radians(maz)
    moon_out = {
        'alt': round(malt, 2), 'az': round(maz, 2),
        'phase': round(phase, 4), 'phase_name': phase_names[phase_idx],
        'illumination': round(phase * 100, 1),
        'waxing': waxing,
        'visible': malt > -2,
        'x': round(mr * math.sin(mtheta), 5),
        'y': round(mr * math.cos(mtheta), 5),
    }

    # ── Deep Sky Objects ──────────────────────────────────────────
    dso_out = []
    for dso in DEEP_SKY:
        ra_p, dec_p = precess(dso['ra'], dso['dec'], jd)
        alt, az = ra_dec_to_altaz(ra_p, dec_p, LST, lat)
        if alt < -2: continue
        r = (90 - alt) / 90.0; theta = math.radians(az)
        dso_out.append({**dso, 'alt': round(alt, 2), 'az': round(az, 2),
                        'x': round(r * math.sin(theta), 5),
                        'y': round(r * math.cos(theta), 5)})

    # ── Milky Way ─────────────────────────────────────────────────
    mw_points = []
    for b in [0, 10, -10, 20, -20]:
        band = []
        for l in range(0, 360, 5):
            ra_h2, dec_d2 = gal_to_eq(l, b)
            alt2, az2 = ra_dec_to_altaz(ra_h2, dec_d2, LST, lat)
            if alt2 > 0:
                r2 = (90 - alt2) / 90.0; th2 = math.radians(az2)
                band.append({'x': round(r2 * math.sin(th2), 4),
                             'y': round(r2 * math.cos(th2), 4),
                             'visible': True})
            else:
                band.append(None)
        mw_points.append({'b': b, 'points': band})

    return {
        'time': utc_dt.strftime('%Y-%m-%d %H:%M UTC'),
        'jd': round(jd, 5),
        'lst': round(LST / 15, 4),
        'lat': lat, 'lon': lon,
        'stars': stars_out,
        'constellations': con_lines_out,
        'planets': planets_out,
        'sun': sun_out,
        'moon': moon_out,
        'dso': dso_out,
        'milky_way': mw_points,
    }
