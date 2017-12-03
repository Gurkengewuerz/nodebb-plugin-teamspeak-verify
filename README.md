# TeamSpeak Verify Plugin for NodeBB
This Plugin allows you to associate one TeamSpeak UID with the forum user.  
After the installation and a successful configuration a new menu item in */user/:userslug/edit* becomes visible.  
![Step 0](./screenshots/verify_step0.png)  
There the user has the option to add a new TS ID. 
![Step 1](./screenshots/verify_step1.png)    
If the Client was found on the Server, the Server Query send the client a random code.
![Step 2](./screenshots/verify_step2.png)  
This random Code must be entered in the new modal.
![Step 3](./screenshots/verify_step3.png)  
If the Code is correct, the TS ID will be saved in database and the client will get the server group.
![Step 4](./screenshots/verify_step4.png)  

## Features
- Add Client to Server Group
- remove TS ID on ban
- allow Admin/Mods to modify the user