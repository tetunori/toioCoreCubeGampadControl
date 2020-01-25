
// Global Constants
const DEFAULT_SPEED = 0.6;
let gMaxSpeed = [ DEFAULT_SPEED, DEFAULT_SPEED ];

const CUBE_SPEC_MAX_SPEED = 115;

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
const MODE_A = 'Normal';
const MODE_B = 'Stick';
const OPE_MODES_NAME_ARRAY =  [ MODE_A, MODE_B ];

const CUBE_CONTROL_MODE_SINGLE = 0;
const CUBE_CONTROL_MODE_DOUBLE = 1;
let gCubeControlMode = CUBE_CONTROL_MODE_SINGLE;
const HOLD_TIME_TO_CHANGE_CUBE_CONTROL_MODE_MSEC = 500;
let gCubeControlModeStartTime = [ undefined, undefined ];

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
                if( ( currentButtonStatus === 1 ) && 
                    ( ( gPreviousHomeButton[ item ] === 0 ) || ( gPreviousHomeButton[ item ] === undefined ) ) ){

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
                    gCubeControlMode = CUBE_CONTROL_MODE_SINGLE;
                    // console.log( gamePad );
                    // console.log( "gGamePadIndex: " + gGamePadIndex );
                    // console.log( gCurrentGamePadIndices );
                }

            }
            gPreviousHomeButton[ item ] = currentButtonStatus;

            // Cube control mode
            if( currentButtonStatus === 1 ){
                let currentTime = ( new Date() ).getTime();
                if( gCubeControlModeStartTime[ item ] === 0 ){
                    // no operatoin.
                }else if( gCubeControlModeStartTime[ item ] === undefined ){
                    gCubeControlModeStartTime[ item ] = currentTime;
                }else{
                    if( currentTime - gCubeControlModeStartTime[ item ] > HOLD_TIME_TO_CHANGE_CUBE_CONTROL_MODE_MSEC ){
                        // Button hold for a long time enough
                        console.log( 'Button hold.' );
                        resetAll();
                        gCubeControlModeStartTime[ item ] = 0;
                        gCubeControlMode = CUBE_CONTROL_MODE_DOUBLE;

                        if( gCurrentGamePadIndices[0] !== item ){

                            // Exchange 0 to 1
                            [ gCurrentGamePadIndices[0], gCurrentGamePadIndices[1] ] 
                                = [ gCurrentGamePadIndices[1], gCurrentGamePadIndices[0] ];

                            // Then, set this item 1st.
                            gCurrentGamePadIndices[0] = item;

                        }

                        vibrateGamePadLong( gamePad );
                        gGamePadIndex = item;

                    }
                }
            }else{
                gCubeControlModeStartTime[ item ] = undefined;
            }
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

const vibrateGamePadLong = ( gamePad ) => {

    if ( gamePad.vibrationActuator ) {
        gamePad.vibrationActuator.playEffect( "dual-rumble", { 
            duration: 500, 
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
        allReset();
    }else if( code === KEYCODE_PLUS ){
        plusMaxSpeed();
    }else if( code === KEYCODE_MINUS ){
        minusMaxSpeed();
    }

}

// Key/gamepad Input Status
const gInputStatus = [{
    xAxisLeft:0.0,
    yAxisLeft:0.0,
    xAxisRight:0.0,
    yAxisRight:0.0,
    maxSpeed:0.0,
    switchOperationMode:0.0,
    exchangeCubes:0.0,
    reset:0.0,
    minusMaxSpeed:0.0,
    plusMaxSpeed:0.0,
    connectCube1:0.0,
    connectCube2:0.0,
    analogMoveDisable:0.0,
    leftTrigger:0.0,
    rightTrigger:0.0,
}, {
    xAxisLeft:0.0,
    yAxisLeft:0.0,
    xAxisRight:0.0,
    yAxisRight:0.0,
    maxSpeed:0.0,
    switchOperationMode:0.0,
    exchangeCubes:0.0,
    reset:0.0,
    minusMaxSpeed:0.0,
    plusMaxSpeed:0.0,
    connectCube1:0.0,
    connectCube2:0.0,
    analogMoveDisable:0.0,
    leftTrigger:0.0,
    rightTrigger:0.0,
}];


// Register into InputStatus
const registerInput = () => {

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
    const GAMEPAD_BT_R2     =  7; // R2 trigger, ZR button 
    const GAMEPAD_BT_8      =  8; // Share button, - button
    const GAMEPAD_BT_9      =  9; // Option button, + button
    const GAMEPAD_BT_UP     = 12;
    const GAMEPAD_BT_DOWN   = 13;
    const GAMEPAD_BT_LEFT   = 14;
    const GAMEPAD_BT_RIGHT  = 15;
    const GAMEPAD_BT_HOME   = 16; // PS button / Home button

    for( let index of [ 0, 1 ] ){

        const gamePad = navigator.getGamepads()[ gCurrentGamePadIndices[ index ] ];
        const gISItem = gInputStatus[ index ];

        // X Axis of Left Analog Stick.
        if( getKeyInputValue( KEYCODE_LEFT ) ){
            if( index === 0 ){ gISItem.xAxisLeft = -1; }
        }else if( getKeyInputValue( KEYCODE_RIGHT ) ){
            if( index === 0 ){ gISItem.xAxisLeft = 1; }
        }else{
            if( gamePad ){
                if( gOperationModeIndexArray[ index ] === 0 ){
                    if( gamePad.buttons[ GAMEPAD_BT_LEFT ].value ){
                        gISItem.xAxisLeft = -1;
                    }else if( gamePad.buttons[ GAMEPAD_BT_RIGHT ].value ){
                        gISItem.xAxisLeft = 1;
                    }else{
                        gISItem.xAxisLeft = gamePad.axes[ GAMEPAD_LEFT_AXIS_X ];
                    }
                }else{
                    gISItem.xAxisLeft = gISItem.xAxisRight;
                }
            }else{
                gISItem.xAxisLeft = 0;
            }
        }
        
        // Y Axis of Left Analog Stick.
        if( getKeyInputValue( KEYCODE_UP ) ){
            if( index === 0 ){ gISItem.yAxisLeft = 1; }
        }else if( getKeyInputValue( KEYCODE_DOWN ) ){
            if( index === 0 ){ gISItem.yAxisLeft = -1; }
        }else{
            if( gamePad ){

                

                if( gamePad.buttons[ GAMEPAD_BT_UP ].value ){
                    gISItem.yAxisLeft = 1;
                }else if( gamePad.buttons[ GAMEPAD_BT_DOWN ].value ){
                    gISItem.yAxisLeft = -1;
                }else{

                    gISItem.yAxisLeft = -1 * gamePad.axes[ GAMEPAD_LEFT_AXIS_Y ];
                    if( gOperationModeIndexArray[ index ] === 1 ){
                        if( isValidAnalogValue( gamePad.buttons[ GAMEPAD_BT_L2 ].value ) ){ 
                            gISItem.yAxisLeft = gamePad.buttons[ GAMEPAD_BT_L2 ].value;
                        }else if( isValidAnalogValue( gamePad.buttons[ GAMEPAD_BT_R2 ].value ) ){ 
                            gISItem.yAxisLeft = -1 * gamePad.buttons[ GAMEPAD_BT_R2 ].value;
                        }
                    }

                }

            }else{
                gISItem.yAxisLeft = 0;
            }
        }

        // Adjust output value outside of the circle for left analog stick.
        if( Math.pow( gISItem.xAxisLeft, 2 ) + Math.pow( gISItem.yAxisLeft, 2 ) > 1 ){
            const angle = Math.atan2( gISItem.yAxisLeft, gISItem.xAxisLeft );
            gISItem.xAxisLeft = Math.cos( angle );
            gISItem.yAxisLeft = Math.sin( angle );
        }

        if( gamePad ){

            // X Axis of Right Analog Stick.
            if( gamePad.buttons[ GAMEPAD_BT_2 ].value ){
                gISItem.xAxisRight = -1;
            }else if( gamePad.buttons[ GAMEPAD_BT_1 ].value ){
                gISItem.xAxisRight = 1;
            }else{
                gISItem.xAxisRight = gamePad.axes[ GAMEPAD_RIGHT_AXIS_X ];
            }

            // Y Axis of Right Analog Stick.
            if( gamePad.buttons[ GAMEPAD_BT_3 ].value ){
                gISItem.yAxisRight = 1;
            }else if( gamePad.buttons[ GAMEPAD_BT_0 ].value ){
                gISItem.yAxisRight = -1;
            }else{
                gISItem.yAxisRight = -1 * gamePad.axes[ GAMEPAD_RIGHT_AXIS_Y ];
            }
            
            // Adjust output value outside of the circle for right analog stick.
            if( Math.pow( gISItem.xAxisRight, 2 ) + Math.pow( gISItem.yAxisRight, 2 ) > 1 ){
                const angle = Math.atan2( gISItem.yAxisRight, gISItem.xAxisRight );
                gISItem.xAxisRight = Math.cos( angle );
                gISItem.yAxisRight = Math.sin( angle );
            }

            // Speed lever / Change button
            gISItem.maxSpeed = CUBE_SPEC_MAX_SPEED * gamePad.buttons[ GAMEPAD_BT_L2 ].value / 100;

            // Exchange Cube1/Cube2 button
            gISItem.exchangeCubes = gamePad.buttons[ GAMEPAD_BT_9 ].value; 

            // Switch Operation mode button
            gISItem.switchOperationMode = gamePad.buttons[ GAMEPAD_BT_8 ].value; 

            // Reset button
            gISItem.reset = gamePad.buttons[ GAMEPAD_BT_HOME ].value;

            // Speed Plus/Minus setting
            gISItem.minusMaxSpeed = gamePad.buttons[ GAMEPAD_BT_L1 ].value;
            gISItem.plusMaxSpeed  = gamePad.buttons[ GAMEPAD_BT_R1 ].value;

            // Analog Omni-direction movement
            gISItem.analogMoveDisable = gamePad.buttons[ GAMEPAD_BT_0 ].value;

            // Left/Right trigger
            gISItem.leftTrigger = gamePad.buttons[ GAMEPAD_BT_L2 ].value;
            gISItem.rightTrigger = gamePad.buttons[ GAMEPAD_BT_R2 ].value;

        }else{

            gISItem.xAxisRight = 0;
            gISItem.yAxisRight = 0;
            gISItem.exchangeCubes = 0;
            gISItem.switchOperationMode = 0;
            gISItem.reset = 0;
            gISItem.minusMaxSpeed = 0;
            gISItem.plusMaxSpeed = 0;
            gISItem.analogMoveDisable = 0;
            gISItem.leftTrigger = 0;
            gISItem.rightTrigger = 0;

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
    if( gCubeControlMode === CUBE_CONTROL_MODE_SINGLE ){
        executeSingleCubeCommand();
    }else{
        executeDoubleCubeCommand();
    }
}

const executeSingleCubeCommand = () => {

    for( let index of [ 0, 1 ] ){
        
        const gISItem = gInputStatus[ index ];

        // Move/Rotation
        if( gOperationModeIndexArray[ index ] === 0 ) {
            if( isValidAnalogValue( gISItem.xAxisRight ) ){
                // rotation mode
                opRotation( index );
                // console.log( "rotation");
            }else{
                if( isValidAnalogValue( gISItem.leftTrigger ) || isValidAnalogValue( gISItem.rightTrigger ) ){ 
                    opTriggerMove( index );
                }else if( isValidAnalogValue( gISItem.xAxisLeft ) || isValidAnalogValue( gISItem.yAxisLeft ) ){ 
                    opMove( index, index );
                }
            }
        }else if( gOperationModeIndexArray[ index ] === 1 ) {
             
            if( isValidAnalogValue( gISItem.yAxisLeft ) ){ 
                opMove( index, index );
            }

        }

    }

}

const executeDoubleCubeCommand = () => {

    const gamepad = navigator.getGamepads()[ gCurrentGamePadIndices[ 0 ] ];
    const gISItem_0 = gInputStatus[ 0 ];

    if( gamepad ){

        if( isValidAnalogValue( gISItem_0.xAxisLeft ) || isValidAnalogValue( gISItem_0.yAxisLeft ) ){ 
            opMove( 0, 0 );
        }

        if( isValidAnalogValue( gISItem_0.xAxisRight ) || isValidAnalogValue( gISItem_0.yAxisRight ) ){ 
            gISItem_0.xAxisLeft = gISItem_0.xAxisRight;
            gISItem_0.yAxisLeft = gISItem_0.yAxisRight;
            opMove( 1, 0 );
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
    const unitSpeed = Math.round( gMaxSpeed[index] * 100 * gISItem.xAxisRight ) / 2;
    setMotorSpeed( gCubes[ index ], unitSpeed, -1 * unitSpeed );
}


// Operation for normal move
const opMove = ( cubeIndex, gamePadIndex ) => {

    const gISItem = gInputStatus[ gamePadIndex ];
    const magnitude = gMaxSpeed[ gamePadIndex ] * 100 * Math.sqrt( gISItem.xAxisLeft * gISItem.xAxisLeft + gISItem.yAxisLeft * gISItem.yAxisLeft );
    // console.log( magnitude );

    let angle;
    if( gISItem.analogMoveDisable === 1 ){
        angle = Math.round( 4 * Math.atan2( gISItem.yAxisLeft, gISItem.xAxisLeft) / Math.PI ) * Math.PI/4;
    }else{
        angle = Math.atan2( gISItem.yAxisLeft, gISItem.xAxisLeft );
    }
    
    // console.log( angle );
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
                right = Math.round( magnitude * gISItem.yAxisLeft );
            }else{
                left  = -1 * Math.round( magnitude );
                right = Math.round( magnitude * gISItem.yAxisLeft );
            }
        }else{
            if( Math.sin( angle ) >= 0 ){
                left  = Math.round( magnitude * gISItem.yAxisLeft );
                right = Math.round( magnitude );
            }else{
                left  = Math.round( magnitude * gISItem.yAxisLeft );
                right = -1 * Math.round( magnitude );
            }
        }
    }
    
    setMotorSpeed( gCubes[ cubeIndex ], left, right );

}

// Operation for trigger move
const opTriggerMove = ( index ) => {

    const gISItem = gInputStatus[ index ];

    // Dare to set left/rigth reversed.
    right = gMaxSpeed[ index ] * Math.round( 100 * gISItem.leftTrigger );
    left = gMaxSpeed[ index ] * Math.round( 100 * gISItem.rightTrigger );
    
    setMotorSpeed( gCubes[ index ], left, right );

}

// Operation for stick mode
const opStickMove = ( index ) => {

    const gISItem = gInputStatus[ index ];
    gISItem.xAxisLeft = gISItem.xAxisRight;
    if( Math.pow( gISItem.xAxisLeft, 2 ) + Math.pow( gISItem.yAxisLeft, 2 ) > 1 ){
        const angle = Math.atan2( gISItem.yAxisLeft, gISItem.xAxisLeft );
        gISItem.xAxisLeft = Math.cos( angle );
        gISItem.yAxisLeft = Math.sin( angle );
    }
    opMove( index, index );

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

const reset = ( index ) => { setMaxSpeed( index, DEFAULT_SPEED ); gOperationModeIndexArray[index] = 0; }
const resetAll = () => { reset(0); reset(1); }

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

    drawAnalogState( -10, 0, index, context, canvas, true );

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
    const gISItem = gInputStatus[ index ];
    let xAxis, yAxis;
    if( isLeft ){
        xAxis = gISItem.xAxisLeft;
        yAxis = gISItem.yAxisLeft;
    }else{
        xAxis = gISItem.xAxisRight;
        yAxis = gISItem.yAxisRight;
    }

    ctx.arc( canvas.width/3 - SQUARE_SIZE / 2  + offsetX + xAxis * SQUARE_SIZE / 2, 
                canvas.height/2 * ( index + 1 ) - SQUARE_SIZE/2 - OFFSET - yAxis * SQUARE_SIZE / 2, 
                    RADIUS, 0, 2 * Math.PI, false );
    
    ctx.fillStyle = "rgba( 255, 255, 255, 1.0 )";
    ctx.fill();
    ctx.closePath();

    ctx.restore();

}

// -- Draw the state of right analog stick. ONLY for x-axis
const drawAnalogRight = ( index, context, canvas ) => {

    drawAnalogState( canvas.width/3 - 18, 0, index, context, canvas, false );

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
    modeText += OPE_MODES_NAME_ARRAY[ gOperationModeIndexArray[ index ] ];
    let xPosMode = 2*canvas.width/3;
    let yPosMode = canvas.height/2 * ( index + 1 ) -100;
    ctx.fillText( modeText, xPosMode, yPosMode );

    // Max speed text
    let maxSpeedText = 'Max Speed: ';
    maxSpeedText += Math.round( gMaxSpeed[ index ] * 100 );
    let xPosMaxSpeed = 2*canvas.width/3;
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
