# toio™Core Cube Gamepad Control
Version 1.0.1  
**Now, we support DualSense 1st Gen (2021/05/29).**  
<img src="./images/screen_10.png" width="800px">
[![movie](https://img.youtube.com/vi/Adt6j601e4E/0.jpg)](https://www.youtube.com/watch?v=Adt6j601e4E)

# Description
A Simple tool enables us to control toio™Core Cubes by a gamepad such as DUALSHOCK 4, DualSense or Joy-Con.  
See [this article](https://qiita.com/tetunori_lego/items/c0cf6999a7667756441f) in detail. You can try [here](https://tetunori.github.io/toioCoreCubeGampadControl/).  
Now, WebBluetooth works on the limited browser/OS. Please check the support status on [Can I Use](https://caniuse.com/#feat=web-bluetooth).

# Topology
<img src="./images/topology.png" width="800px">

# Usage
## Preparation
### Hardware
1. Turn the Cubes on.
2. Prepare some gamepads as DUALSHOCK 4, DualSense or Joy-Con(L&R), then pair the gamepad and PC beforehand. Also, supported some USB gamepads but function may partially limited.<BR><img src="./images/gamepads.jpg" width="300px">

### Software
1. Open [this tool](https://tetunori.github.io/toioCoreCubeGampadControl/). Google Chrome is highly recommended.
2. Push the PS/Home button on the gamepad. You will see the gamepad icon active in the canvas.<BR><img src="./images/105.png" width="250px">
3. Automatically, the dialog for Bluetooth connection will open. Or by pressing "Connect Cube 1/2" button, you can open the dialog manually. Then, you can select and connect Cubes one by one.
4. If the tool is ready, the canvas will show the image like below.<BR><img src="./images/110.png" width="250px">

## Mode Description
We have some modes to control cubes. Please see the chart below.
<BR><img src="./images/mode_description.png" width="800px">
- Single Cube Control
  - Normal mode
    - <img src="./images/IMG_0716.JPG" width="400px">
    - Left analog stick: Move
    - Right analog stick(X-Axis): Rotation in place
  - Stick mode
    - Left analog stick(Y-Axis): Speed
    - Right analog stick(X-Axis): Direction
- Double Cube Control
  - Combined mode
    - <img src="./images/IMG_0719.JPG" width="400px">
    - Left analog stick: Cube1 Move
    - Right analog stick: Cube2 Move
  - Separated mode
    - Mainly, for Joy-Con L/R<BR><img src="./images/IMG_0718.JPG" width="400px">
    - Left analog stick(rotate 90 deg.): Cube1 Move
    - Right analog stick(rotate -90 deg.): Cube2 Move

## Screen Description

### Single Cube Control
<img src="./images/301.png" width="800px">

### Double Cube Control
<img src="./images/302.png" width="800px">

## Operation
### Common
|Category|Gamepad Op.<BR>DUALSHOCK 4/DualSense/Joy-Con|Screen/UI Example|
|---|---|---|
|Exchange Cube1/2|OPTION/+ button|Light Cube1 in blue, Cube2 in green.|
|Reset setting|PS/HOME button|Substitute with START+SELECT button for USB gamepad|
|Adjust speed|L1/R1, L/R button|Default value is 60.|

### Single Cube Control
#### Common
|Category|Gamepad Op.<BR>DUALSHOCK 4/DualSense/Joy-Con|Screen/UI Example|
|---|---|---|
|Register gamepad|PS/Home button|If not registered|
|Switch gamepad1/2|PS/Home button|If registered|
|Switch op. mode|SHARE/- button|Toggle Normal<->Stick|
|Transit to Double Cube Control|Long-press PS/Home button| - |

#### Normal mode
|Category|Gamepad Op.<BR>DUALSHOCK 4/DualSense/Joy-Con|Screen/UI Example|
|---|---|---|
|Analog move|Left analog stick|<img src="./images/IMG_0716.JPG" width="300px">|
|Go forward/backward|UP/DOWN button|top speed|
|Turn|X-axis of right analog stick or LEFT/RIGHT button|Also CIRCLE/A, SQUARE/Y button used as top speed turn in place|

#### Stick mode
|Category|Gamepad Op.<BR>DUALSHOCK 4/DualSense/Joy-Con|Screen/UI Example|
|---|---|---|
|Speed control|Y-axis of left analog stick or left/right trigger|Also UP/DOWN button used as top speed|
|Direction control|X-axis of right analog stick|Also CIRCLE/A, SQUARE/Y button used as max value|

### Double Cube Control
#### Common
|Category|Gamepad Op.<BR>DUALSHOCK 4/DualSense/Joy-Con|Screen/UI Example|
|---|---|---|
|Switch op. mode|SHARE/- button|Toggle Combined<->Separated|
|Transit to Single Cube Control|PS/Home button| - |

#### Combined mode
|Category|Gamepad Op.<BR>DUALSHOCK 4/DualSense/Joy-Con|Screen/UI Example|
|---|---|---|
|Cube1 Analog move|Left analog stick|<img src="./images/IMG_0719.JPG" width="300px">|
|Cube1 forward/backward|UP/DOWN button|top speed|
|Cube1 Turn|LEFT/RIGHT button|top speed turn|
|Cube1 Turn in place|LEFT/RIGHT button with L2/ZL trigger|top speed turn in place|
|Cube2 Analog move|Right analog stick|See the image above.|
|Cube2 forward/backward|TRIANGLE/CROSS button|top speed|
|Cube2 Turn|SQUARE/CIRCLE button|top speed turn|
|Cube2 Turn in place|SQUARE/CIRCLE button with R2/ZR trigger|top speed turn in place|

#### Separated mode
|Category|Gamepad Op.<BR>DUALSHOCK 4/DualSense/Joy-Con|Screen/UI Example|
|---|---|---|
|Cube1 Analog move|Left analog stick<BR>(rotate 90 deg.)|<img src="./images/IMG_0723.JPG" width="300px">|
|Cube1 forward/backward|LEFT/RIGHT button|top speed|
|Cube1 Turn|UP/DOWN button|top speed turn|
|Cube2 Analog move|Right analog stick<BR>(rotate -90 deg.)|<img src="./images/IMG_0722.JPG" width="300px">|
|Cube2 forward/backward|SQUARE/CIRCLE button|top speed|
|Cube2 Turn|TRIANGLE/CROSS button|top speed turn|

# Licence
This software is released under the MIT License, see LICENSE.

# Author
Tetsunori NAKAYAMA.

# References
toio™  
https://toio.io/

toio™Core Cube Specification  
https://toio.github.io/toio-spec/

HTML5 Gamepad Specification  
https://www.w3.org/TR/gamepad/

HTML5 Gamepad Tester  
https://html5gamepad.com/  

Icon  
https://material.io/resources/icons/

UI parts  
https://www.muicss.com/
