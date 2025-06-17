# create new page

After user choose a gender he navigate to a new page ask for a picture
This is how the page should look like:
https://www.figma.com/design/gnQS8qPoztgVCBkZR3wtjI/IceBreak-?node-id=4-160
For the image on the top use woman_take_picture
for the camera icon use
We have icon for whatsapp.
The buttons should not work yet. only the visibility and effects.
Keep this page in joureny so if click refresh come back to the same page.


.I want to be sure when user on this new page, it's save in the state journey in the database, and that on reload if this is the page, it will navigate to it.

Use PageLayout, and input component, and animatedImage, and save the user journey. Update the test to ensiture it goes to that page.
if there is text in multi color and multi size ensure to keep those colors and sizes.
תעשה את זה בצורה משחקית וכייפית


# In the future
add to the topmenu a button to replace my image. When clicked it navigate to the gallery page (As a modal or stack so when closed returning back to the same place where the user did).
Ask me questions before implement.



### Points
The MyPoints compoments should show real data.
The points of this specific user for this specific game.
Create MyPointsContexts.
It should serve two things:

Get the current points of the user. When context ready. It's ask for current points, and update the value. Maybe the GameContext should provide the current game_id.
If game_id change, should receive again the points for that game.
The server can push update for points. Not just from this connection. The user "join" a room under his user_id and game_id, so any connection can update any user points.
In the admin panel Add an input box: "set my user points" and "update". It will update the database, and trigger the update points event (to who in the room).
Should be utilitil library to get user points per game, per user_id, and update user points per game per_id
Please summarise what you want to do, do not start just plan