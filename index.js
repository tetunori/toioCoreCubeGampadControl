
// Global Constants
const DEFAULT_SPEED = 0.6;
let gMaxSpeed = [ DEFAULT_SPEED, DEFAULT_SPEED ];

let gRotationPoint = undefined;
const ROTATION_CENTER      = 0;
const ROTATION_HEAD        = 1;
const ROTATION_TAIL        = 2;
const ROTATION_LEFT_WHEEL  = 3;
const ROTATION_RIGHT_WHEEL = 4;

let gRotationDirection = undefined;
const ROTATION_DIR_LEFT  = 1;
const ROTATION_DIR_RIGHT = 2;

let gGamePadIndexArray = new Array();
let gCurrentGamePadIndices = [ undefined, undefined ];

let gGamePadIndex = undefined;

const gCubes = [ undefined, undefined ];

let gOperationModeIndexArray = [ 0, 0 ];
const OPE_MODES_NAME_ARRAY = ['A', 'B', 'C'];


// On Input
// Gamepad Listner
if ( window.GamepadEvent ) {

  window.addEventListener( "gamepadconnected", ( event ) => {
    // console.log( "Gamepad connected." );
    // console.log( event.gamepad );
    gGamePadIndexArray.push( event.gamepad.index );
    // gGamePadIndex = gGamePadIndexArray[0];
    console.log( gGamePadIndexArray );
  });

  window.addEventListener( "gamepaddisconnected", ( event ) => {
    // console.log( "Gamepad disconnected." );
    // console.log( event.gamepad );
    gGamePadIndex = undefined;
  });

}

// Key Input
const KEYCODE_ESC   =  27;
const KEYCODE_LEFT  =  37;
const KEYCODE_UP    =  38;
const KEYCODE_RIGHT =  39;
const KEYCODE_DOWN  =  40;
const KEYCODE_D     =  68;
const KEYCODE_F     =  70;
const KEYCODE_H     =  72;
const KEYCODE_Q     =  81;
const KEYCODE_R     =  82;
const KEYCODE_T     =  84;
const KEYCODE_PLUS  = 187;
const KEYCODE_MINUS = 189;

let gKeyInputStatus = [
    { code: KEYCODE_ESC  , value:0 },
    { code: KEYCODE_LEFT , value:0 },
    { code: KEYCODE_UP   , value:0 },
    { code: KEYCODE_RIGHT, value:0 },
    { code: KEYCODE_DOWN , value:0 },
    { code: KEYCODE_D    , value:0 },
    { code: KEYCODE_F    , value:0 },
    { code: KEYCODE_H    , value:0 },
    { code: KEYCODE_Q    , value:0 },
    { code: KEYCODE_R    , value:0 },
    { code: KEYCODE_T    , value:0 },
    { code: KEYCODE_PLUS , value:0 },
    { code: KEYCODE_MINUS, value:0 },
];

const getKeyInputValue = ( keyCode ) => {
    return gKeyInputStatus.find( item => item.code === keyCode ).value;
}

// Handle key events.
window.addEventListener( 'keydown', ( event ) => { InputKeyValue( event.keyCode, 1 ), procKeyDown( event.keyCode ); });
window.addEventListener( 'keyup',   ( event ) => { InputKeyValue( event.keyCode, 0 ) });

const InputKeyValue = ( keyCode, value ) => {

    // console.log( keyCode );
    for( let item of gKeyInputStatus ){
        if( item.code === keyCode ){
            item.value = value;
            break;
        }
    }

}

let gPreviousHomeButton = [ undefined, undefined ];
const selectGamePad = () => {

    const GAMEPAD_BT_HOME = 16;

    let gamePad;
    for( let item of gGamePadIndexArray ){
        gamePad = navigator.getGamepads()[ item ];
        if( gamePad !== undefined ){
            let currentButtonStatus = gamePad.buttons[ GAMEPAD_BT_HOME ].value;
            if( currentButtonStatus !== gPreviousHomeButton[ item ] ){
                if( ( currentButtonStatus === 1 ) && ( gPreviousHomeButton[ item ] === 0 ) ){

                    if( gCurrentGamePadIndices.indexOf( item ) !== -1 ){
                        // item is aleady in this array.
                        // exchange 0 to 1
                        [ gCurrentGamePadIndices[0], gCurrentGamePadIndices[1] ] 
                            = [ gCurrentGamePadIndices[1], gCurrentGamePadIndices[0] ];
                    
                    }else{

                        // 1st, search for slot.
                        if( gCurrentGamePadIndices[0] === undefined ){
                            gCurrentGamePadIndices[0] = item;
                        }else if( gCurrentGamePadIndices[1] === undefined ){
                            gCurrentGamePadIndices[1] = item;
                        }else{
                            // slots are full.
                            // set this item to 0
                            gCurrentGamePadIndices[1] = gCurrentGamePadIndices[0];
                            gCurrentGamePadIndices[0] = item;
                        }

                    }

                    vibrateGamePad( gamePad );
                    gGamePadIndex = item;
                    // console.log( gamePad );
                    // console.log( "gGamePadIndex: " + gGamePadIndex );
                    // console.log( gCurrentGamePadIndices );
                }

            }
            gPreviousHomeButton[ item ] = currentButtonStatus;
        }
    }
    
}

const vibrateGamePad = ( gamePad ) => {

    if ( gamePad.vibrationActuator ) {
        gamePad.vibrationActuator.playEffect( "dual-rumble", { 
            duration: 150, 
            weakMagnitude: 1.0,
            strongMagnitude: 1.0 
        } );
    }

}

// Procedure on Key Down
const procKeyDown = ( code ) => {

    if( code === KEYCODE_Q ){
        exchangeCubes();
    }else if( code === KEYCODE_ESC ){
        reset(0); reset(1);
    }else if( code === KEYCODE_PLUS ){
        plusMaxSpeed();
    }else if( code === KEYCODE_MINUS ){
        minusMaxSpeed();
    }

}

// Key/gamepad Input Status
const gInputStatus = [{
    xAxisMove:0.0,
    yAxisMove:0.0,
    rotationLeftRight:0.0,
    rotation:0.0,
    headRotation:0.0,
    tailRotation:0.0,
    leftWheelRotation:0.0,
    rightWheelRotation:0.0,
    maxSpeed:0.0,
    changeMaxSpeed:0.0,
    switchOperationMode:0.0,
    exchangeCubes:0.0,
    reset:0.0,
    minusMaxSpeed:0.0,
    plusMaxSpeed:0.0,
    connectCube1:0.0,
    connectCube2:0.0,
    analogMoveDisable:0.0,
}, {
    xAxisMove:0.0,
    yAxisMove:0.0,
    rotationLeftRight:0.0,
    rotation:0.0,
    headRotation:0.0,
    tailRotation:0.0,
    leftWheelRotation:0.0,
    rightWheelRotation:0.0,
    maxSpeed:0.0,
    changeMaxSpeed:0.0,
    switchOperationMode:0.0,
    exchangeCubes:0.0,
    reset:0.0,
    minusMaxSpeed:0.0,
    plusMaxSpeed:0.0,
    connectCube1:0.0,
    connectCube2:0.0,
    analogMoveDisable:0.0,
}
]


// Register into InputStatus
const registerInput = () => {

    for( let index of [ 0, 1 ] ){

        const gamePad = navigator.getGamepads()[ gCurrentGamePadIndices[ index ] ];

        const GAMEPAD_LEFT_AXIS_X  = 0;
        const GAMEPAD_LEFT_AXIS_Y  = 1;
        const GAMEPAD_RIGHT_AXIS_X = 2;
        const GAMEPAD_RIGHT_AXIS_Y = 3;

        const GAMEPAD_BT_0      =  0; // CROSS button, B button 
        const GAMEPAD_BT_1      =  1; // CIRCLE button, A button
        const GAMEPAD_BT_2      =  2; // SQUARE button, Y button
        const GAMEPAD_BT_3      =  3; // TRIANGLE button, X button
        const GAMEPAD_BT_L1     =  4; // L1 button, L button
        const GAMEPAD_BT_R1     =  5; // R1 button, R button
        const GAMEPAD_BT_L2     =  6; // L2 trigger, ZL button 
        const GAMEPAD_BT_8      =  8; // Share button, - button
        const GAMEPAD_BT_9      =  9; // Option button, + button
        const GAMEPAD_BT_UP     = 12;
        const GAMEPAD_BT_DOWN   = 13;
        const GAMEPAD_BT_LEFT   = 14;
        const GAMEPAD_BT_RIGHT  = 15;
        const GAMEPAD_BT_HOME   = 16; // PS button / Home button

        const gISItem = gInputStatus[ index ];

        // Move: X Axis ( Analog Stick mapping )
        if( getKeyInputValue( KEYCODE_LEFT ) === 1 ){
            if( index === 0 ){ gISItem.xAxisMove = -1; }
        }else if( getKeyInputValue( KEYCODE_RIGHT ) === 1 ){
            if( index === 0 ){ gISItem.xAxisMove = 1; }
        }else{
            if( gamePad ){
                gISItem.xAxisMove = gamePad.axes[ GAMEPAD_LEFT_AXIS_X ];
            }else{
                gISItem.xAxisMove = 0;
            }
        }
        
        // Move: Y Axis ( Analog Stick mapping )
        if( getKeyInputValue( KEYCODE_UP ) === 1 ){
            if( index === 0 ){ gISItem.yAxisMove = 1; }
        }else if( getKeyInputValue( KEYCODE_DOWN ) === 1 ){
            if( index === 0 ){ gISItem.yAxisMove = -1; }
        }else{
            if( gamePad ){
                gISItem.yAxisMove = -1 * gamePad.axes[ GAMEPAD_LEFT_AXIS_Y ];
            }else{
                gISItem.yAxisMove = 0;
            }
        }

        // Set output value on the circle for a diagonal position such as Up-left. 
        // Later, we should generalize this.
        if( ( Math.abs( gISItem.xAxisMove ) + Math.abs( gISItem.yAxisMove ) ) === 2 ){
            if( ( getKeyInputValue( KEYCODE_UP ) === 1  ) || 
                    ( getKeyInputValue( KEYCODE_DOWN ) === 1  ) ){
                gISItem.xAxisMove /= Math.sqrt(2);
                gISItem.yAxisMove /= Math.sqrt(2);
            }
        }
        
        // Rotation left/right key, right analog stick 
        if( gamePad ){
            if( isValidAnalogValue( gamePad.axes[ GAMEPAD_RIGHT_AXIS_X ] ) ){
                gISItem.rotation = 1;
            }else{
                gISItem.rotation = 0;
            }
            gISItem.rotationLeftRight = gamePad.axes[ GAMEPAD_RIGHT_AXIS_X ];
        }else{
            gISItem.rotationLeftRight = 0;
        }

        // Speed lever / Change button
        if( gamePad ){
            gISItem.changeMaxSpeed = gamePad.buttons[ GAMEPAD_BT_1 ].value;
            gISItem.maxSpeed = gamePad.buttons[ GAMEPAD_BT_L2 ].value * 115 / 100;
        }

        // Exchange Cube1/Cube2 button
        if( gamePad ){ 
            gISItem.exchangeCubes = gamePad.buttons[ GAMEPAD_BT_9 ].value; 
        }else{
            gISItem.exchangeCubes = 0;
        }

        // Switch Operation mode button
        if( gamePad ){ 
            gISItem.switchOperationMode = gamePad.buttons[ GAMEPAD_BT_8 ].value; 
        }else{
            gISItem.switchOperationMode = 0;
        }

        // Reset button
        if( gamePad ){
            gISItem.reset = gamePad.buttons[ GAMEPAD_BT_HOME ].value;
        }else{
            gISItem.reset = 0;
        }

        // Speed Plus/Minus setting
        if( gamePad ){
            gISItem.minusMaxSpeed = gamePad.buttons[ GAMEPAD_BT_L1 ].value;
            gISItem.plusMaxSpeed  = gamePad.buttons[ GAMEPAD_BT_R1 ].value;
        }else{
            gISItem.minusMaxSpeed = 0;
            gISItem.plusMaxSpeed = 0;
        }

        // Analog Omni-direction movement
        if( gamePad ){
            gISItem.analogMoveDisable = gamePad.buttons[ GAMEPAD_BT_0 ].value;
        }else{
            gISItem.analogMoveDisable = 0;
        }

    }

}


// Main loop
const MAIN_LOOP_INTERVAL_MSEC = 50;
let gPreviousExecuteTime = undefined;

const updateStatus = () => {

    selectGamePad();
    registerInput();
    opSettings();

    let currentTime = ( new Date() ).getTime();
    if( gPreviousExecuteTime === undefined ){
        gPreviousExecuteTime = currentTime;
    }

    // Avoid issuing ble command too fast
    if( ( currentTime - gPreviousExecuteTime ) > MAIN_LOOP_INTERVAL_MSEC ){
        executeCubeCommand();
        gPreviousExecuteTime = currentTime;
    }

    // Draw canvas
    const canvas = document.getElementById( "operationCanvas" );        
    const ctx = canvas.getContext("2d");

    drawBackground( ctx, canvas );

    for( let index of [ 0, 1 ] ){
        drawAnalogLeft( index, ctx, canvas );
        drawAnalogRight( index, ctx, canvas );
        drawStatus( index, ctx, canvas );
        
        // Mainly for before connection
        drawConnectionState( index, ctx, canvas );
        drawControllerDescription( index, ctx, canvas );
    }

    window.requestAnimationFrame( updateStatus );
}

const executeCubeCommand = () => {

    for( let index of [ 0, 1 ] ){
        
        const gISItem = gInputStatus[ index ];

        // Move/Rotation
        if( gISItem.rotation === 1 ){
            // rotation mode
            opRotation( index );
            console.log( "rotation");
        }else if( isValidAnalogValue( gISItem.xAxisMove ) || isValidAnalogValue( gISItem.yAxisMove ) ){ 
            // Omni-direction movement mode.
            opMove( index );
            // console.log( "move." );
        }else{
            // opNoCommand();
        }

    }
}


// Operations

// Opratoin for setting.
let gPreviousExchangeCubes = [ 0.0, 0.0 ];
let gPreviousSwitchOperationMode = [ 0.0, 0.0 ];
let gPreviousReset = [ 0.0, 0.0 ];
let gPreviousMinusMaxSpeed = [ 0.0, 0.0 ];
let gPreviousPlusMaxSpeed = [ 0.0, 0.0 ];
let gChangeSpeedMode = [ 0, 0 ];

const opSettings = () => {

    for( let index of [ 0, 1 ] ){
            
        const gISItem = gInputStatus[ index ];

        // Head/Tail cube setting
        if( gISItem.exchangeCubes === 1 ){
            if( gPreviousExchangeCubes[ index ] === 0 ){
                // Exchange 0/1 gCubes
                exchangeCubes();
                // console.log( "exchangeCubes done ");
            }
        }
        gPreviousExchangeCubes[ index ] = gISItem.exchangeCubes;

        // Switch operation mode
        if( gISItem.switchOperationMode === 1 ){
            if( gPreviousSwitchOperationMode[ index ] === 0 ){
                // Switch operation mode to next one.
                switchOperationMode( index );
            }
        }
        gPreviousSwitchOperationMode[ index ] = gISItem.switchOperationMode;

        // Reset setting
        if( gISItem.reset === 1 ){
            if( gPreviousReset[ index ] === 0 ){
                reset( index );
                // console.log( "Reset done ");
            }
        }
        gPreviousReset[ index ] = gISItem.reset;

        // minus max speed
        if( gISItem.minusMaxSpeed === 1 ){
            if( gPreviousMinusMaxSpeed[ index ] === 0 ){
                minusMaxSpeed( index );
            }
        }
        gPreviousMinusMaxSpeed[ index ] = gISItem.minusMaxSpeed;
        
        // plus max speed
        if( gISItem.plusMaxSpeed === 1 ){
            if( gPreviousPlusMaxSpeed[ index ] === 0 ){
                plusMaxSpeed( index );
            }
        }
        gPreviousPlusMaxSpeed[ index ] = gISItem.plusMaxSpeed;


    }

}

// Operation for Rotation around center
const opRotation = ( index ) => {
    const gISItem = gInputStatus[ index ];
    const unitSpeed = Math.round( gMaxSpeed[index] * 100 * gISItem.rotationLeftRight );
    setMotorSpeed( gCubes[ index ], unitSpeed, -1 * unitSpeed );
}


// Operation for omni-direction move
const opMove = ( index ) => {

    const gISItem = gInputStatus[ index ];
    const magnitude = gMaxSpeed[index] * 100 * Math.sqrt( gISItem.xAxisMove * gISItem.xAxisMove + gISItem.yAxisMove * gISItem.yAxisMove );
    // console.log( magnitude );

    let angle;
    if( gISItem.analogMoveDisable === 1 ){
        angle = Math.round( 4 * Math.atan2( gISItem.yAxisMove, gISItem.xAxisMove) / Math.PI ) * Math.PI/4;
    }else{
        angle = Math.atan2( gISItem.yAxisMove, gISItem.xAxisMove );
    }
    
    console.log( angle );
    let left, right;

    // Forward 
    if( Math.abs( angle - Math.PI/2 ) < Math.PI/9 ){
        left  = Math.round( magnitude );
        right = Math.round( magnitude );
    }else if( Math.abs( angle + Math.PI/2 ) < Math.PI/9 ){
        left  = -1 * Math.round( magnitude );
        right = -1 * Math.round( magnitude );
    }else if( Math.abs( angle ) < Math.PI/18 ){
        left  = Math.round( magnitude );
        right = Math.round( 0 );
    }else if( ( Math.abs( angle + Math.PI ) < Math.PI/18 ) || ( Math.abs( angle - Math.PI ) < Math.PI/18 ) ){
        left  = Math.round( 0 );
        right = Math.round( magnitude );
    }else{
        if( Math.cos( angle ) >= 0 ){
            if( Math.sin( angle ) >= 0 ){
                left  = Math.round( magnitude );
                right = Math.round( magnitude * gISItem.yAxisMove );
            }else{
                left  = -1 * Math.round( magnitude );
                right = Math.round( magnitude * gISItem.yAxisMove );
            }
        }else{
            if( Math.sin( angle ) >= 0 ){
                left  = Math.round( magnitude * gISItem.yAxisMove );
                right = Math.round( magnitude );
            }else{
                left  = Math.round( magnitude * gISItem.yAxisMove );
                right = -1 * Math.round( magnitude );
            }
        }
    }
    

    

/*
    if( ( -3 * Math.PI/4 < angle ) && ( angle < -1 * Math.PI/4 ) ){
        // Backward
        if( Math.abs( angle + Math.PI/2 ) < Math.PI/18 ){
            angle = -1 * Math.PI/2;
        }
        left  = Math.round( magnitude * Math.sin( angle/2 - Math.PI / 2 ) );
        right = Math.round( magnitude * Math.sin( angle/2) );
    }else if( ( -1 * Math.PI/4  < angle ) && ( angle < 0 ) ){
        left  = Math.round( magnitude * Math.sin( Math.PI / 2 ) );
        right = Math.round( magnitude * Math.sin( 0 ) );
    }else if( ( -1 * Math.PI < angle ) && ( angle < -3 * Math.PI/4 ) ){
        left  = Math.round( magnitude * Math.sin( Math.PI ) );
        right = Math.round( magnitude * Math.sin( Math.PI / 2 ) );
    }else{
        // Forward 
        if( Math.abs( angle - Math.PI/2 ) < Math.PI/18 ){
            angle = Math.PI/2;
        }
        left  = Math.round( magnitude * Math.sin( angle/2 + Math.PI / 2 ) );
        right = Math.round( magnitude * Math.sin( angle/2 ) );
    }
*/
    setMotorSpeed( gCubes[index], left, right );

}

// Operation for no command
const opNoCommand = () => {

}


// Sub-Functions
const setMaxSpeed = ( index, speed ) => {

    gMaxSpeed[index] = speed;

}

const plusMaxSpeed = ( index ) => {
    let speed = gMaxSpeed[index] + 0.05;
    if( speed > 1.15 ){
        speed = 1.15;
    }
    setMaxSpeed( index, speed );
}

const minusMaxSpeed = ( index ) => {
    let speed = gMaxSpeed[index] - 0.05;
    if( speed < 0 ){
        speed = 0;
    }
    setMaxSpeed( index, speed );
}

const exchangeCubes = () => {

    [ gCubes[0], gCubes[1] ] = [ gCubes[1], gCubes[0] ];

    // Turn light on.
    let cube = gCubes[0];
    if( ( cube !== undefined ) && ( cube.lightChar !== undefined ) ){
        turnOnLightCian( cube );
    }

    cube = gCubes[1];
    if( ( cube !== undefined ) && ( cube.lightChar !== undefined ) ){
        turnOnLightGreen( cube );
    }

}

const switchOperationMode = ( index ) => {

    gOperationModeIndexArray[ index ]++;
    if( gOperationModeIndexArray[ index ] > OPE_MODES_NAME_ARRAY.length - 1 ){
        gOperationModeIndexArray[ index ] = 0;
    }

}

const lightHeadCube = () => { turnOnLightWhiteBriefly( gCubes[0] ); }

const reset = ( index ) => { setMaxSpeed( index, DEFAULT_SPEED ); }

const isValidAnalogValue = ( value ) => {

    const THREASHOLD = 0.1;
    if( Math.abs( value ) > THREASHOLD ){
        return true;
    }else{
        return false;
    }

}


// Cube Connection
const SERVICE_UUID              = '10b20100-5b3b-4571-9508-cf3efcd7bbae';
const MOTOR_CHARCTERISTICS_UUID = '10b20102-5b3b-4571-9508-cf3efcd7bbae';
const LIGHT_CHARCTERISTICS_UUID = '10b20103-5b3b-4571-9508-cf3efcd7bbae';

const connectNewCube = () => {

    const cube = { 
        device:undefined, 
        sever:undefined, 
        service:undefined, 
        motorChar:undefined, 
        lightChar:undefined 
    };

    // Scan only toio Core Cubes
    const options = {
        filters: [
            { services: [ SERVICE_UUID ] },
        ],
    }

    navigator.bluetooth.requestDevice( options ).then( device => {
        cube.device = device;
        disableConnectCubeButton( cube );
        return device.gatt.connect();
    }).then( server => {
        cube.server = server;
        return server.getPrimaryService( SERVICE_UUID );
    }).then(service => {
        cube.service = service;
        return cube.service.getCharacteristic( MOTOR_CHARCTERISTICS_UUID );
    }).then( characteristic => {
        cube.motorChar = characteristic;
        return cube.service.getCharacteristic( LIGHT_CHARCTERISTICS_UUID );
    }).then( characteristic => {
        cube.lightChar = characteristic;
        if( cube === gCubes[0] ){
            turnOnLightCian( cube );
        }else{
            turnOnLightGreen( cube );
        }
    });

    return cube;
}

const disableConnectCubeButton = ( cube ) => {

    if( gCubes[0] === cube ){
        document.getElementById( "btConnectCube1" ).disabled = true;
    }else{
        document.getElementById( "btConnectCube2" ).disabled = true;
    }
    
}


// Cube Commands
// -- Light Commands
const turnOffAllLight = () => {

    turnOffLight( gCubes[0] );
    turnOffLight( gCubes[1] );

}

const turnOffLight = ( cube ) => {

    const CMD_TURN_OFF = 0x01;
    const buf = new Uint8Array([ CMD_TURN_OFF ]);
    if( ( cube !== undefined ) && ( cube.lightChar !== undefined ) ){
        cube.lightChar.writeValue( buf );
    }

}

const turnOnLightGreen = ( cube ) => {

    // Green light
    const buf = new Uint8Array([ 0x03, 0x00, 0x01, 0x01, 0x00, 0xFF, 0x00 ]);
    if( ( cube !== undefined ) && ( cube.lightChar !== undefined ) ){
        cube.lightChar.writeValue( buf );
    }

}

const turnOnLightCian = ( cube ) => {

    // Cian light
    const buf = new Uint8Array([ 0x03, 0x00, 0x01, 0x01, 0x00, 0xFF, 0xFF ]);
    if( ( cube !== undefined ) && ( cube.lightChar !== undefined ) ){
        cube.lightChar.writeValue( buf );
    }

}

const turnOnLightWhiteBriefly = ( cube ) => {

    // White light for 1 sec.
    const buf = new Uint8Array([ 0x03, 0x32, 0x01, 0x01, 0xFF, 0xFF, 0xFF ]);
    if( ( cube !== undefined ) && ( cube.lightChar !== undefined ) ){
        cube.lightChar.writeValue( buf );
    }

}

// -- Motor Commands
const setMotorSpeed = ( cube, left, right ) => {
    
    let leftDirection;
    if( left > 0 ){
        leftDirection = 0x01;
    }else{
        leftDirection = 0x02;
    }

    let rightDirection;
    if( right > 0 ){
        rightDirection = 0x01;
    }else{
        rightDirection = 0x02;
    }

    const MOTOR_DURATION = 0x10;  // 160msec
    const buf = new Uint8Array([ 0x02, 0x01, leftDirection, Math.abs( left ), 
                                        0x02, rightDirection, Math.abs( right ), MOTOR_DURATION ]);

    if( ( cube !== undefined ) && ( cube.motorChar !== undefined ) ){
        cube.motorChar.writeValue( buf );
    }

}


// Draw functions
// -- Draw Background
const drawBackground = ( context, canvas ) => {

    const ctx = context;
    canvas.width = 400;
    canvas.height = 300;
    ctx.save();
    ctx.fillStyle = "rgba( 0, 148, 170, 1 )" ;    
    ctx.fillRect( 0, 0, canvas.width, canvas.height/2 );
    ctx.fillStyle = "rgba( 146, 168, 0, 1 )" ;    
    ctx.fillRect( 0, canvas.height/2, canvas.width, canvas.height/2 );
    ctx.restore();
}

// -- Draw the state of left analog stick
const drawAnalogLeft = ( index, context, canvas ) => {

    drawAnalogState( -6, 0, index, context, canvas, true );

}

const drawAnalogState = ( offsetX, offsetY, index, context, canvas, isLeft ) => {

    const SQUARE_SIZE = 100;
    const OFFSET = 10;

    const ctx = context;
    ctx.save();
    ctx.fillStyle = "rgba( 255, 255, 255, 0.3 )" ;
    ctx.strokeStyle = "rgba( 255, 255, 255, 0.6 )" ;

    // Rect for rim
    ctx.strokeRect( canvas.width/3 - SQUARE_SIZE + offsetX, canvas.height/2 * ( index + 1 ) - SQUARE_SIZE - OFFSET, 
        SQUARE_SIZE, SQUARE_SIZE );
    ctx.fillRect( canvas.width/3 - SQUARE_SIZE + offsetX, canvas.height/2 * ( index + 1 ) - SQUARE_SIZE - OFFSET, 
        SQUARE_SIZE, SQUARE_SIZE );
    
    // Circle
    ctx.beginPath();
    ctx.arc( canvas.width/3 - SQUARE_SIZE / 2 + offsetX, 
        canvas.height/2 * ( index + 1 ) - SQUARE_SIZE / 2 - OFFSET,
        SQUARE_SIZE / 2, 0, Math.PI * 2 );
    
    // Center lines
    ctx.moveTo( canvas.width/3 - SQUARE_SIZE / 2 + offsetX, canvas.height/2 * ( index + 1 )- SQUARE_SIZE - OFFSET );
    ctx.lineTo( canvas.width/3 - SQUARE_SIZE / 2 + offsetX, canvas.height/2 * ( index + 1 ) - OFFSET );
    ctx.moveTo( canvas.width/3 - SQUARE_SIZE + offsetX, canvas.height/2 * ( index + 1 ) - SQUARE_SIZE/2 - OFFSET );
    ctx.lineTo( canvas.width/3 + offsetX, canvas.height/2 * ( index + 1 ) - SQUARE_SIZE/2 - OFFSET );
    ctx.stroke();

    // Pointer
    ctx.beginPath();
    const RADIUS = 5;
    const GAMEPAD_LEFT_AXIS_X = 0;
    const GAMEPAD_LEFT_AXIS_Y = 1;
    const GAMEPAD_RIGHT_AXIS_X = 2;
    const GAMEPAD_RIGHT_AXIS_Y = 3;
    const gamepad = navigator.getGamepads()[ gCurrentGamePadIndices[ index ] ];
    if( gamepad ){
        let xAxisMove, yAxisMove;
        if( isLeft ){
            xAxisMove = gamepad.axes[ GAMEPAD_LEFT_AXIS_X ];
            yAxisMove = -1 * gamepad.axes[ GAMEPAD_LEFT_AXIS_Y ];
        }else{
            xAxisMove = gamepad.axes[ GAMEPAD_RIGHT_AXIS_X ];
            yAxisMove = -1 * gamepad.axes[ GAMEPAD_RIGHT_AXIS_Y ];
        }

        ctx.arc( canvas.width/3 - SQUARE_SIZE / 2  + offsetX + xAxisMove * SQUARE_SIZE / 2, 
                    canvas.height/2 * ( index + 1 ) - SQUARE_SIZE/2 - OFFSET - yAxisMove * SQUARE_SIZE / 2, 
                        RADIUS, 0, 2 * Math.PI, false );
    }
    ctx.fillStyle = "rgba( 255, 255, 255, 1.0 )";
    ctx.fill();
    ctx.closePath();

    ctx.restore();

}

// -- Draw the state of right analog stick. ONLY for x-axis
const drawAnalogRight = ( index, context, canvas ) => {

    drawAnalogState( canvas.width/3 - 10, 0, index, context, canvas, false );

}

// -- Draw connection status panel
const cubeImage = new Image();
const cubeCheckedImage = new Image();
const controllerImage = new Image();

cubeImage.src = "./images/cube.png";
cubeCheckedImage.src = "./images/cube_checked.png";
controllerImage.src = "./images/controller.png";

const drawConnectionState = ( index, context, canvas ) => {
    const ctx = context;
    const CUBE_SIZE = 120;
    let image = cubeImage;
    
    ctx.save();
    if( !isReady4Control( index ) ){
        // Not Ready yet. so this panel is needed.

        ctx.fillStyle = "rgba( 0, 0, 0, 1 )" ;
        ctx.fillRect( 0, index * canvas.height / 2, canvas.width, canvas.height / 2 );
        
        // For Head cube
        if( ( gCubes[index] !== undefined ) && ( gCubes[index].server !== undefined ) ){
            // connected & service registered
            ctx.globalAlpha = 1.0;
            image = cubeImage;
            if( gCubes[index].lightChar !== undefined ){
                // ready for using.
                image = cubeCheckedImage;
            }
        }else{
            // Not connected yet
            image = cubeImage;
            ctx.globalAlpha = 0.3;
        }
        ctx.drawImage( image, canvas.width/3 - CUBE_SIZE/2, ( 2 * index + 1 ) * canvas.height/4 - CUBE_SIZE/2, CUBE_SIZE, CUBE_SIZE );

        // For game pad status
        if( gCurrentGamePadIndices[index] !== undefined ){
            ctx.globalAlpha = 1.0;
        }else{
            ctx.globalAlpha = 0.3;
        }
        ctx.drawImage( controllerImage, canvas.width/3 + CUBE_SIZE/2, ( 2 * index + 1 ) * canvas.height/4 - CUBE_SIZE/2, CUBE_SIZE, CUBE_SIZE );

    }
    ctx.restore();

}

const drawControllerDescription = ( index, context, canvas ) => {
    const ctx = context;
    const CUBE_SIZE = 120;
    ctx.save();
    
    // Game pad's description
    let description = '';
    let xPosDesc = canvas.width/3 + CUBE_SIZE/2 + 60;
    if( isReady4Control( index ) ){
        xPosDesc = canvas.width/2;
    }
    let yPosDesc = ( 2 * index + 1 ) * canvas.height/4 - 48;

    if( gCurrentGamePadIndices[index] !== undefined ){
        description = getDescription( index );
        if( description.length > 20 ){
            description = description.slice( 0, 20 ) + '...';;
        }
    }

    ctx.font = "17px 'Noto Sans JP'";
    ctx.textAlign = 'center'
    ctx.fillStyle = 'rgba(255, 255, 255)';
    ctx.fillText( description, xPosDesc, yPosDesc );

    ctx.restore();

}

const drawStatus = ( index, context, canvas ) => {
    const ctx = context;
    const CUBE_SIZE = 120;
    ctx.save();
    
    ctx.font = "14px 'Noto Sans JP'";
    ctx.textAlign = 'left'
    ctx.fillStyle = 'rgba(255, 255, 255)';

    // Mode text
    let modeText = 'Op. Mode: ';
    modeText += OPE_MODES_NAME_ARRAY[ gOperationModeIndexArray[index] ];
    let xPosMode = 2*canvas.width/3 + 12;
    let yPosMode = canvas.height/2 * ( index + 1 ) -100;
    ctx.fillText( modeText, xPosMode, yPosMode );

    // Max speed text
    let maxSpeedText = 'Max Speed: ';
    maxSpeedText += Math.round( gMaxSpeed[index] * 100 );
    let xPosMaxSpeed = 2*canvas.width/3 + 12;
    let yPosMaxSpeed = canvas.height/2 * ( index + 1 ) - 70;
    ctx.fillText( maxSpeedText, xPosMaxSpeed, yPosMaxSpeed );

    ctx.restore();

}

const getDescription = ( index ) => {

    let description;
    let gamepad = navigator.getGamepads()[ gCurrentGamePadIndices[ index ] ];
    if( gamepad ){

        if( isJoyCon( index ) ){
            description = 'Joy-Con L+R';
        }else if( isDualShock4_1stGen( index ) ){
            description = 'DUALSHOCK 4(1st Gen)';
        }else if( isDualShock4_2ndGen( index ) ){
            description = 'DUALSHOCK 4(2nd Gen)';
        }else{
            description = gamepad.id;
        }
    }

    return description;

}

const isReady4Control = ( index ) => {

    if( ( gCubes[ index ] === undefined ) 
        || ( gCubes[ index ].lightChar === undefined ) 
            || ( gCurrentGamePadIndices[ index ] === undefined ) ){
        return false;
    }else{
        return true;
    }

}

const isDualShock4_1stGen = ( gamepadIdx ) => {

    let gamepad = navigator.getGamepads()[ gCurrentGamePadIndices[ gamepadIdx ] ];
    if( gamepad ){

        let gamepadDesc = gamepad.id;
        if( gamepadDesc.indexOf('Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 05c4)') !== -1 ){
            return true;
        }else{
            return false;
        }

    }else{
        return false;
    }

}

const isDualShock4_2ndGen = ( gamepadIdx ) => {

    let gamepad = navigator.getGamepads()[ gCurrentGamePadIndices[ gamepadIdx ] ];
    if( gamepad ){

        let gamepadDesc = gamepad.id;
        if( gamepadDesc.indexOf('Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 09cc)') !== -1 ){
            return true;
        }else{
            return false;
        }

    }else{
        return false;
    }

}

const isDualShock4 = ( gamepadIdx ) => {

    if( isDualShock4_1stGen( gamepadIdx ) || isDualShock4_2ndGen( gamepadIdx ) ){
        return true;
    }else{
        return false;
    }
    
}

const isJoyCon = ( gamepadIdx ) => {

    let gamepad = navigator.getGamepads()[ gCurrentGamePadIndices[ gamepadIdx ] ];
    if( gamepad ){

        let gamepadDesc = gamepad.id;
        if( gamepadDesc.indexOf('Joy-Con L+R') !== -1 ){
            return true;
        }else{
            return false;
        }

    }else{
        return false;
    }
    
}

// Initialize 
const initialize = () => {
    
    // Event Listning for GUI buttons.
    for( let item of [ 1, 2 ] ){
        document.getElementById( "btConnectCube" + item ).addEventListener( "click", async ev => {

            if( item === 1 ){
                gCubes[0] = connectNewCube();
            }else{
                gCubes[1] = connectNewCube();
            }
            
        });
    }

    document.getElementById( "btShowOperation" ).addEventListener( "click", async ev => {
        window.open('https://github.com/tetunori/MechanumWheelControlWebBluetooth/blob/master/README.md','_blank');
    });

    setMaxSpeed( 0, DEFAULT_SPEED );
    setMaxSpeed( 1, DEFAULT_SPEED );

    updateStatus();

}

initialize();
