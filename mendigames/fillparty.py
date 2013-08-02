from mendigames.models import Character, Campaign, Container

cam = Campaign(name='MyCampaign', text='My campaign1 text')
cam.save()
con1 = Container(name='MyCharacter1I', gold='1000', campaign=cam)
con1.save()
con2 = Container(name='MyCharacter2I',  gold='20000', campaign=cam)
con2.save()
Character(name='MyCharacter1', hit_points='600', healing_surges='20', 
    experience_points='20000', campaign=cam, container=con1).save()
Character(name='MyCharacter2', hit_points='60', healing_surges='8', 
    experience_points='2000', campaign=cam, container=con2).save()

1/0