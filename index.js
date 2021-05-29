
// Global Constants
const DEFAULT_SPEED = 0.6;
let gMaxSpeed = [ DEFAULT_SPEED, DEFAULT_SPEED ];

let gGamePadIndexArray = new Array();
let gCurrentGamePadIndices = [ undefined, undefined ];

const gCubes = [ undefined, undefined ];

// -- Cube Control Mode: Single/Double
const CUBE_CONTROL_MODE_SINGLE = 0;
const CUBE_CONTROL_MODE_DOUBLE = 1;
let gCubeControlMode = CUBE_CONTROL_MODE_SINGLE;

// -- Operation Mode
let gOperationModeIndexArray = [ 0, 0 ];
const MODE_A_SINGLE = 'Normal';
const MODE_B_SINGLE = 'Stick';
const OPE_MODES_NAME_ARRAY_SINGLE = [ MODE_A_SINGLE, MODE_B_SINGLE ];
const MODE_A_DOUBLE = 'Combined';
const MODE_B_DOUBLE = 'Separated';
const OPE_MODES_NAME_ARRAY_DOUBLE = [ MODE_A_DOUBLE, MODE_B_DOUBLE ];


// On Gamepad
// -- Gamepad Listner
if ( window.GamepadEvent ) {

    window.addEventListener( "gamepadconnected", ( event ) => {
        // console.log( "Gamepad connected." );
        // console.log( event.gamepad );
        // console.log( gGamePadIndexArray );
        gGamePadIndexArray.push( event.gamepad.index );
    });

    window.addEventListener( "gamepaddisconnected", ( event ) => {
        // console.log( "Gamepad disconnected." );
        // console.log( event.gamepad );
    });

}

// -- Procedure on Home button
let gPreviousHomeButtonStatus = [ undefined, undefined ];
const handleHomeButton = () => {

    for( let item of gGamePadIndexArray ){
        const gamePad = navigator.getGamepads()[ item ];
        if( gamePad !== undefined ){
            let currentHomeButtonStatus;
            if( gamePad.buttons[ GAMEPAD_BT_HOME ] ){
                currentHomeButtonStatus = gamePad.buttons[ GAMEPAD_BT_HOME ].value;
            }else{
                currentHomeButtonStatus = gamePad.buttons[ GAMEPAD_BT_8 ].value && 
                                            gamePad.buttons[ GAMEPAD_BT_9 ].value;
            }
            if( currentHomeButtonStatus !== gPreviousHomeButtonStatus[ item ] ){
                if( ( currentHomeButtonStatus === 1 ) && 
                    ( ( gPreviousHomeButtonStatus[ item ] === 0 ) || 
                    ( gPreviousHomeButtonStatus[ item ] === undefined ) ) ){
                    // Home button pressed.
                    selectGamePad( item );
                }

            }
            gPreviousHomeButtonStatus[ item ] = currentHomeButtonStatus;

            // Cube control mode
            transitToDoubleCubeControlMode( item );

        }
    }
    
}

// -- Select game pad as controller
const selectGamePad = ( idGamepad ) => {
    
    const gCGPI = gCurrentGamePadIndices;
    if( gCGPI.indexOf( idGamepad ) !== -1 ){
        // This item is aleady in this array.
        // exchange 0 to 1
        [ gCGPI[0], gCGPI[1] ] = [ gCGPI[1], gCGPI[0] ];

    }else{

        // 1st, search for vacant slot.
        if( gCGPI[0] === undefined ){
            gCGPI[0] = idGamepad;
            if( document.getElementById( "btConnectCube1" ).disabled === false ){
                gCubes[0] = connectNewCube();
            }
        }else if( gCGPI[1] === undefined ){
            gCGPI[1] = idGamepad;
            if( document.getElementById( "btConnectCube2" ).disabled === false ){
                gCubes[1] = connectNewCube();
            }
        }else{
            // slots are full.
            // set this to 0
            gCGPI[1] = gCGPI[0];
            gCGPI[0] = idGamepad;
        }

    }

    const gamePad = navigator.getGamepads()[ idGamepad ];
    vibrateGamePad( gamePad, gCGPI[0] !== idGamepad );
    gCubeControlMode = CUBE_CONTROL_MODE_SINGLE;

}

// -- Switch cube control mode to 'Double'
let gCubeControlModeStartTime = [ undefined, undefined ];
const transitToDoubleCubeControlMode = ( idGamepad ) => {

    const gamePad = navigator.getGamepads()[ idGamepad ];

    let currentHomeButtonStatus;
    if( gamePad.buttons[ GAMEPAD_BT_HOME ] ){
        currentHomeButtonStatus = gamePad.buttons[ GAMEPAD_BT_HOME ].value;
    }else{
        currentHomeButtonStatus = gamePad.buttons[ GAMEPAD_BT_8 ].value && 
                                    gamePad.buttons[ GAMEPAD_BT_9 ].value;
    }

    const gCCMST = gCubeControlModeStartTime;

    if( currentHomeButtonStatus === 1 ){

        const currentTime = ( new Date() ).getTime();
        
        if( gCCMST[ idGamepad ] === 0 ){
            // no operatoin.
        }else if( gCCMST[ idGamepad ] === undefined ){
            gCCMST[ idGamepad ] = currentTime;
        }else{
            const HOLD_TIME = 500; // msec
            if( currentTime - gCCMST[ idGamepad ] > HOLD_TIME ){

                // Button hold for a long time enough
                // console.log( 'Button hold.' );
                resetAll();
                gCCMST[ idGamepad ] = 0;
                gCubeControlMode = CUBE_CONTROL_MODE_DOUBLE;

                const gCGPI = gCurrentGamePadIndices;
                if( gCGPI[0] !== idGamepad ){

                    // Exchange 0 to 1
                    [ gCGPI[0], gCGPI[1] ] = [ gCGPI[1], gCGPI[0] ];

                    // Then, set this item 1st.
                    gCGPI[0] = idGamepad;

                }
                vibrateGamePadLong( gamePad );

            }
        }

    }else{
        gCCMST[ idGamepad ] = undefined;
    }
    
}

// -- Vibrate functions
// --- Interface
const vibrateGamePad = ( gamePad, isTwice ) => {

    const INTERVAL = 200; // msec

    vibrateGamePadOnce( gamePad );
    if( isTwice ){
        setTimeout( () => { vibrateGamePadOnce( gamePad ); }, INTERVAL );
    }

}

// -- Single vibration.
const vibrateGamePadOnce = ( gamePad ) => { _vibrateGamePad( gamePad, 150 ); }

// -- Long and single vibration.
const vibrateGamePadLong = ( gamePad ) => { _vibrateGamePad( gamePad, 500 ); }

// Actual vibration function
const _vibrateGamePad = ( gamePad, duration ) => {

    if ( gamePad.vibrationActuator ) {

        gamePad.vibrationActuator.playEffect( "dual-rumble", { 
            duration: duration, 
            weakMagnitude: 1.0,
            strongMagnitude: 1.0 
        } );

    }

}

// Key/gamepad Input Status
const gInputStatus = [{
    xAxisLeft:0.0,
    yAxisLeft:0.0,
    xAxisLeftBeforeAdjust:undefined,
    yAxisLeftBeforeAdjust:undefined,
    xAxisRight:0.0,
    yAxisRight:0.0,
    maxSpeed:0.0,
    switchOperationMode:0.0,
    exchangeCubes:0.0,
    reset:0.0,
    minusMaxSpeed:0.0,
    plusMaxSpeed:0.0,
    leftTrigger:0.0,
    rightTrigger:0.0,
}, {
    xAxisLeft:0.0,
    yAxisLeft:0.0,
    xAxisLeftBeforeAdjust:undefined,
    yAxisLeftBeforeAdjust:undefined,
    xAxisRight:0.0,
    yAxisRight:0.0,
    maxSpeed:0.0,
    switchOperationMode:0.0,
    exchangeCubes:0.0,
    reset:0.0,
    minusMaxSpeed:0.0,
    plusMaxSpeed:0.0,
    leftTrigger:0.0,
    rightTrigger:0.0,
}];

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

// Register into InputStatus
const registerInput = () => {

    for( let index of [ 0, 1 ] ){

        const gamePad = navigator.getGamepads()[ gCurrentGamePadIndices[ index ] ];
        const gISItem = gInputStatus[ index ];

        
        if( gamePad ){
            
            // X Axis of Left Analog Stick.
            if( ( gOperationModeIndexArray[ index ] === 1 ) &&
                ( gCubeControlMode === CUBE_CONTROL_MODE_SINGLE ) ){
                // Single && Stick control 
                gISItem.xAxisLeft = gISItem.xAxisRight;
            }else{
                if( gamePad.buttons[ GAMEPAD_BT_LEFT ] && gamePad.buttons[ GAMEPAD_BT_LEFT ].value ){
                    gISItem.xAxisLeft = -1;
                }else if( gamePad.buttons[ GAMEPAD_BT_RIGHT ] && gamePad.buttons[ GAMEPAD_BT_RIGHT ].value ){
                    gISItem.xAxisLeft = 1;
                }else{
                    gISItem.xAxisLeft = gamePad.axes[ GAMEPAD_LEFT_AXIS_X ];
                }
            }

            // Y Axis of Left Analog Stick.
            if( gamePad.buttons[ GAMEPAD_BT_UP ] && gamePad.buttons[ GAMEPAD_BT_UP ].value ){
                gISItem.yAxisLeft = 1;
            }else if( gamePad.buttons[ GAMEPAD_BT_DOWN ] && gamePad.buttons[ GAMEPAD_BT_DOWN ].value ){
                gISItem.yAxisLeft = -1;
            }else{
                gISItem.yAxisLeft = -1 * gamePad.axes[ GAMEPAD_LEFT_AXIS_Y ];
                if( ( gOperationModeIndexArray[ index ] === 1 ) &&
                    ( gCubeControlMode === CUBE_CONTROL_MODE_SINGLE ) ){
                    // Single && Stick control 
                    if( isValidAnalogValue( gamePad.buttons[ GAMEPAD_BT_L2 ].value ) ){ 
                        gISItem.yAxisLeft = gamePad.buttons[ GAMEPAD_BT_L2 ].value;
                    }else if( isValidAnalogValue( gamePad.buttons[ GAMEPAD_BT_R2 ].value ) ){ 
                        gISItem.yAxisLeft = -1 * gamePad.buttons[ GAMEPAD_BT_R2 ].value;
                    }
                }
            }

            // Adjust output value outside of the circle for left analog stick.
            if( Math.pow( gISItem.xAxisLeft, 2 ) + Math.pow( gISItem.yAxisLeft, 2 ) > 1 ){
                const angle = Math.atan2( gISItem.yAxisLeft, gISItem.xAxisLeft );
                gISItem.xAxisLeftBeforeAdjust = gISItem.xAxisLeft;
                gISItem.yAxisLeftBeforeAdjust = gISItem.yAxisLeft;
                gISItem.xAxisLeft = Math.cos( angle );
                gISItem.yAxisLeft = Math.sin( angle );
            }else{
                gISItem.xAxisLeftBeforeAdjust = undefined;
                gISItem.yAxisLeftBeforeAdjust = undefined;
            }

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

            // Exchange Cube1/Cube2 button
            gISItem.exchangeCubes = gamePad.buttons[ GAMEPAD_BT_9 ].value; 

            // Switch Operation mode button
            gISItem.switchOperationMode = gamePad.buttons[ GAMEPAD_BT_8 ].value; 

            // Reset button
            if( gamePad.buttons[ GAMEPAD_BT_HOME ] ){
                gISItem.reset = gamePad.buttons[ GAMEPAD_BT_HOME ].value;
            }else{
                gISItem.reset = gamePad.buttons[ GAMEPAD_BT_8 ].value && 
                                            gamePad.buttons[ GAMEPAD_BT_9 ].value;
            }

            // Speed Plus/Minus setting
            gISItem.minusMaxSpeed = gamePad.buttons[ GAMEPAD_BT_L1 ].value;
            gISItem.plusMaxSpeed  = gamePad.buttons[ GAMEPAD_BT_R1 ].value;

            // Left/Right trigger
            gISItem.leftTrigger = gamePad.buttons[ GAMEPAD_BT_L2 ].value;
            gISItem.rightTrigger = gamePad.buttons[ GAMEPAD_BT_R2 ].value;

        }else{

            gISItem.xAxisLeft = 0;
            gISItem.yAxisLeft = 0;
            gISItem.xAxisRight = 0;
            gISItem.yAxisRight = 0;
            gISItem.exchangeCubes = 0;
            gISItem.switchOperationMode = 0;
            gISItem.reset = 0;
            gISItem.minusMaxSpeed = 0;
            gISItem.plusMaxSpeed = 0;
            gISItem.leftTrigger = 0;
            gISItem.rightTrigger = 0;

        }
    }
}


// Main loop
const MAIN_LOOP_INTERVAL_MSEC = 50;
let gPreviousExecuteTime = undefined;

const updateStatus = () => {

    handleHomeButton();
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
        drawDescription( index, ctx, canvas );
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

        if( gOperationModeIndexArray[ index ] === 0 ) {
            // Single Normal control mode
            if( isValidAnalogValue( gISItem.xAxisRight ) ){
                // rotation
                opRotation( index, index, false );
                // console.log( "rotation");
            }else{
                if( isValidAnalogValue( gISItem.leftTrigger ) || isValidAnalogValue( gISItem.rightTrigger ) ){ 
                    opTriggerMove( index );
                }else if( isValidAnalogValue( gISItem.xAxisLeft ) || isValidAnalogValue( gISItem.yAxisLeft ) ){ 
                    opMove( index, index );
                }
            }
        }else if( gOperationModeIndexArray[ index ] === 1 ) {
            // Single Stick control mode
            if( isValidAnalogValue( gISItem.yAxisLeft ) ){ 
                opMove( index, index );
            }
        }

    }

}

const executeDoubleCubeCommand = () => {

    const gamepad = navigator.getGamepads()[ gCurrentGamePadIndices[ 0 ] ];
    const gISItem_0 = gInputStatus[ 0 ];
    const gISItem_1 = gInputStatus[ 1 ];

    if( gamepad ){

        // Cube 1 procedure
        if( isValidAnalogValue( gISItem_0.xAxisLeft ) || isValidAnalogValue( gISItem_0.yAxisLeft ) ){ 
            if( gOperationModeIndexArray[ 0 ] === 0 ){
                // Double combined control
                if( ( gamepad.buttons[ GAMEPAD_BT_L2 ] && ( gamepad.buttons[ GAMEPAD_BT_L2 ].value === 1 ) ) 
                        && ( ( gamepad.buttons[ GAMEPAD_BT_LEFT ] && ( gamepad.buttons[ GAMEPAD_BT_LEFT ].value === 1 ) )
                            || ( gamepad.buttons[ GAMEPAD_BT_RIGHT ] && ( gamepad.buttons[ GAMEPAD_BT_RIGHT ].value === 1 ) ) ) ){
                    opRotation( 0, 0, true );
                }else{
                    opMove( 0, 0 );
                }
            }else{
                // Double separated control
                opMoveSeparated( 0, 0 );
            }
        }

        // Cube 2 procedure
        if( isValidAnalogValue( gISItem_0.xAxisRight ) || isValidAnalogValue( gISItem_0.yAxisRight ) ){
            // Use input status 1 tentatively for controlling 
            gISItem_1.xAxisLeft = gISItem_0.xAxisRight;
            gISItem_1.yAxisLeft = gISItem_0.yAxisRight;
            setMaxSpeed( 1, getMaxSpeed( 0 ) );
            if( gOperationModeIndexArray[ 0 ] === 0 ){
                // Double combined control
                if( ( gamepad.buttons[ GAMEPAD_BT_R2 ] && ( gamepad.buttons[ GAMEPAD_BT_R2 ].value === 1 ) ) 
                        && ( ( gamepad.buttons[ GAMEPAD_BT_1 ] && ( gamepad.buttons[ GAMEPAD_BT_1 ].value === 1 ) )
                            || ( gamepad.buttons[ GAMEPAD_BT_2 ] && ( gamepad.buttons[ GAMEPAD_BT_2 ].value === 1 ) ) ) ){
                    opRotation( 1, 0, false );
                }else{
                    opMove( 1, 1 );
                }
            }else{
                // Double separated control
                opMoveSeparated( 1, 1 );
            }
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

const opSettings = () => {

    for( let index of [ 0, 1 ] ){
            
        const gISItem = gInputStatus[ index ];

        // Exchange Cube1/2
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

// Operation for Rotation
const opRotation = ( cubeIndex, gamePadIndex, isLeftAnalogStick ) => {
    const gISItem = gInputStatus[ gamePadIndex ];
    let xAxisAnalogStick = gISItem.xAxisRight;
    if( isLeftAnalogStick ){
        xAxisAnalogStick = gISItem.xAxisLeft;
    }
    const unitSpeed = Math.round( gMaxSpeed[ gamePadIndex ] * 100 * xAxisAnalogStick ) / 2;
    setMotorSpeed( gCubes[ cubeIndex ], unitSpeed, -1 * unitSpeed );
}

// Move operation for normal contorl mode
const opMove = ( cubeIndex, gamePadIndex ) => {

    const gISItem = gInputStatus[ gamePadIndex ];
    const magnitude = gMaxSpeed[ gamePadIndex ] * 100 * 
                        Math.sqrt( Math.pow( gISItem.xAxisLeft, 2 ) + Math.pow( gISItem.yAxisLeft, 2 ) );
    // console.log( magnitude );

    let angle;
    angle = Math.atan2( gISItem.yAxisLeft, gISItem.xAxisLeft );
    
    // console.log( angle );
    let left, right;

    if( Math.abs( angle - Math.PI/2 ) < Math.PI/9 ){
        // Locked for Forward 
        left  = Math.round( magnitude );
        right = Math.round( magnitude );
    }else if( Math.abs( angle + Math.PI/2 ) < Math.PI/9 ){
        // Locked for Backward 
        left  = -1 * Math.round( magnitude );
        right = -1 * Math.round( magnitude );
    }else if( Math.abs( angle ) < Math.PI/18 ){
        // Locked for turning clockwise
        left  = Math.round( magnitude );
        right = Math.round( 0 );
    }else if( ( Math.abs( angle + Math.PI ) < Math.PI/18 ) || 
              ( Math.abs( angle - Math.PI ) < Math.PI/18 ) ){
        // Locked for turning counter-clockwise
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

// Move operation for separated contorl mode
const opMoveSeparated = ( cubeIndex, gamePadIndex ) => {

    const gISItem = gInputStatus[ gamePadIndex ];
    const gISItem_0 = gInputStatus[ 0 ];

    if( gamePadIndex === 0 ){

        // Store original values for canvas drawing.
        gISItem.xAxisLeftBeforeAdjust = gISItem.xAxisLeft;
        gISItem.yAxisLeftBeforeAdjust = gISItem.yAxisLeft;
        
        // Left side gamepad. Rotate by Math.PI/2 counter-clockwise.
        [ gISItem.xAxisLeft, gISItem.yAxisLeft ] 
            = [ -1 * gISItem.yAxisLeft, gISItem.xAxisLeft ];

    }else{

        // Right side gamepad. Rotate by Math.PI/2 clockwise.
        [ gISItem.xAxisLeft, gISItem.yAxisLeft ] 
            = [ gISItem_0.yAxisRight, -1 * gISItem_0.xAxisRight ];

    }

    opMove( cubeIndex, gamePadIndex );

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
    // Of course, no operation...
}


// Sub-Functions
const getMaxSpeed = ( index ) => {
    return gMaxSpeed[ index ];
}

const setMaxSpeed = ( index, speed ) => {
    gMaxSpeed[ index ] = speed;
}

const plusMaxSpeed = ( index ) => {
    let speed = gMaxSpeed[ index ] + 0.05;
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

    const gOMIA = gOperationModeIndexArray;
    gOMIA[ index ]++;
    if( gOMIA[ index ] > gOMIA.length - 1 ){
        gOMIA[ index ] = 0;
    }

}

const lightHeadCube = () => { turnOnLightWhiteBriefly( gCubes[ 0 ] ); }

const reset = ( index ) => { setMaxSpeed( index, DEFAULT_SPEED ); gOperationModeIndexArray[ index ] = 0; }
const resetAll = () => { reset( 0 ); reset( 1 ); }

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

    if( gCubeControlMode === CUBE_CONTROL_MODE_SINGLE ){
        drawBackgroundSingle( context, canvas );
    }else{
        drawBackgroundDouble( context, canvas );
    }

}

// -- Draw Background for Single control mode
const drawBackgroundSingle = ( context, canvas ) => {

    const ctx = context;
    canvas.width = 400;
    canvas.height = 300;
    ctx.save();

    // Blue region
    ctx.fillStyle = "rgba( 0, 148, 170, 1 )" ;    
    ctx.fillRect( 0, 0, canvas.width, canvas.height/2 );
    
    // Green region
    ctx.fillStyle = "rgba( 146, 168, 0, 1 )" ;    
    ctx.fillRect( 0, canvas.height/2, canvas.width, canvas.height/2 );
    
    ctx.restore();

}

// -- Draw Background for Double control mode
const drawBackgroundDouble = ( context, canvas ) => {

    const ctx = context;
    canvas.width = 400;
    canvas.height = 300;
    ctx.save();

    // Upper half background grey
    ctx.fillStyle = "rgba( 192, 192, 192, 1 )" ;
    ctx.fillRect( 0, 0, canvas.width, canvas.height/2 );

    // Title band
    ctx.fillStyle = "rgba( 0, 0, 0, 1 )" ;
    ctx.fillRect( 0, 0, canvas.width, canvas.height/8 );

    // Lower Blue region
    ctx.fillStyle = "rgba( 0, 148, 170, 1 )" ;
    ctx.fillRect( 0, canvas.height/2, canvas.width/2, canvas.height/2 );
    
    // Lower Green region
    ctx.fillStyle = "rgba( 146, 168, 0, 1 )" ;
    ctx.fillRect( canvas.width/2, canvas.height/2, canvas.width/2, canvas.height/2 );
    
    ctx.restore();

} 

// -- Draw the state of left analog stick
const drawAnalogLeft = ( index, context, canvas ) => {

    if( gCubeControlMode === CUBE_CONTROL_MODE_SINGLE ){
        drawAnalogLeftSingle( index, context, canvas );
    }else{
        drawAnalogLeftDouble( index, context, canvas );
    }

}

const drawAnalogLeftSingle = ( index, context, canvas ) => {
    const X_OFFSET = -10;
    drawAnalogStateSingle( X_OFFSET, 0, index, context, canvas, true );
}

const drawAnalogLeftDouble = ( index, context, canvas ) => {
    if( index === 0 ){
        drawAnalogStateDouble( 0, 0, context, canvas, true );
    }
}

// -- Draw the state of right analog stick
const drawAnalogRight = ( index, context, canvas ) => {

    if( gCubeControlMode === CUBE_CONTROL_MODE_SINGLE ){
        drawAnalogRightSingle( index, context, canvas );
    }else{
        drawAnalogRightDouble( index, context, canvas );
    }

}

const drawAnalogRightSingle = ( index, context, canvas ) => {
    const X_OFFSET = canvas.width/3 - 18;
    drawAnalogStateSingle( X_OFFSET, 0, index, context, canvas, false );
}

const drawAnalogRightDouble = ( index, context, canvas ) => {
    const X_OFFSET = canvas.width/2;
    if( index === 0 ){
        drawAnalogStateDouble( X_OFFSET, 0, context, canvas, false );
    }
}

// -- Draw analog status core function for Single
const drawAnalogStateSingle = ( offsetX, offsetY, index, context, canvas, isLeft ) => {

    const SQUARE_SIZE = 100;
    const HALF_SQUARE_SIZE = SQUARE_SIZE / 2;
    const OFFSET = 10;

    const ctx = context;
    ctx.save();
    ctx.fillStyle = "rgba( 255, 255, 255, 0.3 )" ;
    ctx.strokeStyle = "rgba( 255, 255, 255, 0.6 )" ;

    // Rect for rim
    const RECT_X = canvas.width/3 - SQUARE_SIZE + offsetX;
    const RECT_Y = canvas.height/2 * ( index + 1 ) - SQUARE_SIZE - OFFSET;
    ctx.strokeRect( RECT_X, RECT_Y, SQUARE_SIZE, SQUARE_SIZE );
    ctx.fillRect( RECT_X, RECT_Y, SQUARE_SIZE, SQUARE_SIZE );
    
    // Circle
    ctx.beginPath();
    ctx.arc( RECT_X + HALF_SQUARE_SIZE, RECT_Y + HALF_SQUARE_SIZE, 
                                        HALF_SQUARE_SIZE, 0, Math.PI * 2 );
    
    // Center lines
    ctx.moveTo( RECT_X + HALF_SQUARE_SIZE, RECT_Y );
    ctx.lineTo( RECT_X + HALF_SQUARE_SIZE, RECT_Y + SQUARE_SIZE );
    ctx.moveTo( RECT_X,                    RECT_Y + HALF_SQUARE_SIZE );
    ctx.lineTo( RECT_X + SQUARE_SIZE,      RECT_Y + HALF_SQUARE_SIZE );
    ctx.stroke();

    // Pointer
    ctx.beginPath();
    const RADIUS = 5;
    const gISItem = gInputStatus[ index ];
    let xAxis = 0, yAxis = 0;

    if( isLeft ){
        if( gOperationModeIndexArray[ index ] === 0 ){
            xAxis = gISItem.xAxisLeft;
        }

        if( gISItem.yAxisLeftBeforeAdjust !== undefined ){
            yAxis = gISItem.yAxisLeftBeforeAdjust;
        }else{
            yAxis = gISItem.yAxisLeft;
        }
    }else{
        if( gOperationModeIndexArray[ index ] === 0 ){
            yAxis = gISItem.yAxisRight;
        }

        if( gISItem.xAxisRightBeforeAdjust !== undefined ){
            xAxis = gISItem.xAxisRightBeforeAdjust;
        }else{
            xAxis = gISItem.xAxisRight;
        }
    }

    ctx.arc( RECT_X + HALF_SQUARE_SIZE + xAxis * HALF_SQUARE_SIZE, 
                RECT_Y + HALF_SQUARE_SIZE - yAxis * HALF_SQUARE_SIZE, 
                    RADIUS, 0, 2 * Math.PI, false );
    
    ctx.fillStyle = "rgba( 255, 255, 255, 1.0 )";
    ctx.fill();
    ctx.closePath();

    // Gray out
    if( gOperationModeIndexArray[ index ] === 1 ){

        // Single Stick control mode.
        ctx.fillStyle = "rgba( 0, 0, 0, 0.3 )" ;
        
        if( isLeft ){        
            ctx.fillRect( RECT_X, RECT_Y, SQUARE_SIZE * 2 / 5, SQUARE_SIZE );
            ctx.fillRect( RECT_X + SQUARE_SIZE * 3 / 5, RECT_Y, SQUARE_SIZE * 2 / 5, SQUARE_SIZE );
        }else{
            ctx.fillRect( RECT_X, RECT_Y, SQUARE_SIZE, SQUARE_SIZE * 2 / 5 );
            ctx.fillRect( RECT_X, RECT_Y + SQUARE_SIZE * 3 / 5, SQUARE_SIZE, SQUARE_SIZE * 2 / 5 );
        }
        
    }
    
    ctx.restore();

}

// -- Draw analog status core function for Double
const drawAnalogStateDouble = ( offsetX, offsetY, context, canvas, isLeft ) => {

    const SQUARE_SIZE = 100;
    const HALF_SQUARE_SIZE = SQUARE_SIZE / 2;
    const OFFSET = 10;

    const ctx = context;
    ctx.save();
    ctx.fillStyle = "rgba( 255, 255, 255, 0.3 )" ;
    ctx.strokeStyle = "rgba( 255, 255, 255, 0.6 )" ;

    // Rect for rim
    const RECT_X = canvas.width/8 + offsetX;
    const RECT_Y = canvas.height/2 * 2 - SQUARE_SIZE - OFFSET;
    ctx.strokeRect( RECT_X, RECT_Y, SQUARE_SIZE, SQUARE_SIZE );
    ctx.fillRect( RECT_X, RECT_Y, SQUARE_SIZE, SQUARE_SIZE );
    
    // Circle
    ctx.beginPath();
    ctx.arc( RECT_X + HALF_SQUARE_SIZE, RECT_Y + HALF_SQUARE_SIZE,
                HALF_SQUARE_SIZE, 0, Math.PI * 2 );
    
    // Center lines
    ctx.moveTo( RECT_X + HALF_SQUARE_SIZE, RECT_Y );
    ctx.lineTo( RECT_X + HALF_SQUARE_SIZE, RECT_Y + SQUARE_SIZE );
    ctx.moveTo( RECT_X,                    RECT_Y + HALF_SQUARE_SIZE );
    ctx.lineTo( RECT_X + SQUARE_SIZE,      RECT_Y + HALF_SQUARE_SIZE );
    ctx.stroke();

    // Pointer
    ctx.beginPath();
    const RADIUS = 5;
    const gISItem = gInputStatus[ 0 ];
    let xAxis = 0, yAxis = 0;

    if( isLeft ){
        if( gISItem.xAxisLeftBeforeAdjust ){
            xAxis = gISItem.xAxisLeftBeforeAdjust;
        }else{
            xAxis = gISItem.xAxisLeft;
        }

        if( gISItem.xAxisLeftBeforeAdjust ){
            yAxis = gISItem.yAxisLeftBeforeAdjust;
        }else{
            yAxis = gISItem.yAxisLeft;
        }
    }else{
        xAxis = gISItem.xAxisRight;
        yAxis = gISItem.yAxisRight;
    }

    if( gOperationModeIndexArray[ 0 ] === 1 ){
        // Double Separated control mode
        if( isLeft ){
            [ xAxis, yAxis ] = [ -1 * yAxis, xAxis ];
        }else{
            [ xAxis, yAxis ] = [ yAxis, -1 * xAxis ];
        }
    }

    ctx.arc( RECT_X + HALF_SQUARE_SIZE + xAxis * HALF_SQUARE_SIZE, 
            RECT_Y + HALF_SQUARE_SIZE - yAxis * HALF_SQUARE_SIZE, 
                RADIUS, 0, 2 * Math.PI, false );

    ctx.fillStyle = "rgba( 255, 255, 255, 1.0 )";
    ctx.fill();
    ctx.closePath();

    ctx.restore();

}

// -- Draw connection status panel
const cubeImage = new Image();
const cubeCheckedImage = new Image();
const controllerImage = new Image();

cubeImage.src = "./images/cube.png";
cubeCheckedImage.src = "./images/cube_checked.png";
controllerImage.src = "./images/controller.png";

const drawConnectionState = ( index, context, canvas ) => {
    
    if( gCubeControlMode === CUBE_CONTROL_MODE_SINGLE ){
        drawConnectionStateSingle( index, context, canvas );
    }else{
        drawConnectionStateDouble( context, canvas );
    }

}

const drawConnectionStateSingle = ( index, context, canvas ) => {
    const ctx = context;
    const CUBE_SIZE = 120;
    let image = cubeImage;
    
    ctx.save();
    if( !isReady4Control( index ) ){
        // Not Ready yet. so this panel is needed.

        // Back ground
        ctx.fillStyle = "rgba( 0, 0, 0, 1 )" ;
        ctx.fillRect( 0, index * canvas.height / 2, canvas.width, canvas.height / 2 );
        
        // For Cube icon
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
        const IMAGE_Y = ( 2 * index + 1 ) * canvas.height/4 - CUBE_SIZE/2;
        ctx.drawImage( image, canvas.width/3 - CUBE_SIZE/2, IMAGE_Y, CUBE_SIZE, CUBE_SIZE );

        // For game pad status
        if( gCurrentGamePadIndices[index] !== undefined ){
            ctx.globalAlpha = 1.0;
        }else{
            ctx.globalAlpha = 0.3;
        }
        ctx.drawImage( controllerImage, canvas.width/3 + CUBE_SIZE/2, IMAGE_Y, CUBE_SIZE, CUBE_SIZE );

    }
    ctx.restore();

}

const drawConnectionStateDouble = ( context, canvas ) => {
    const ctx = context;
    const CUBE_SIZE = 120;
    let image = cubeImage;
    
    ctx.save();
    if( !isReady4ControlDouble() ){
        // Not Ready yet. so this panel is needed.

        ctx.fillStyle = "rgba( 0, 0, 0, 1 )" ;
        ctx.fillRect( 0, 0, canvas.width, canvas.height );
        
        // For Cube icon
        for( let index of [ 0, 1 ] ){

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
                ctx.globalAlpha = 0.3;
                image = cubeImage;
            }
            ctx.drawImage( image, ( 2 * index + 1 ) * canvas.width/4 - CUBE_SIZE/2, 
                                    3 * canvas.height/4 - CUBE_SIZE/2, CUBE_SIZE, CUBE_SIZE );

        }

        // For game pad status
        if( gCurrentGamePadIndices[0] !== undefined ){
            ctx.globalAlpha = 1.0;
        }else{
            ctx.globalAlpha = 0.3;
        }
        ctx.drawImage( controllerImage, canvas.width/2 - CUBE_SIZE/2, canvas.height/8 + 20, 
                            CUBE_SIZE, CUBE_SIZE );

    }
    ctx.restore();

}

const drawDescription = ( index, context, canvas ) => {
    
    if( gCubeControlMode === CUBE_CONTROL_MODE_SINGLE ){
        drawDescriptionControllerSingle( index, context, canvas );
    }else{
        drawDescriptionControllerDouble( context, canvas );
        if( isReady4ControlDouble() ){
            drawDescriptionDoubleMode( context, canvas );
        }
    }

}

const drawDescriptionControllerSingle = ( index, context, canvas ) => {

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

const drawDescriptionControllerDouble = ( context, canvas ) => {

    const ctx = context;
    ctx.save();
    
    // Game pad's description
    let description = '';
    let xPosDesc = canvas.width/2;
    let yPosDesc = 3 * canvas.height/8 - 46;

    if( gCurrentGamePadIndices[0] !== undefined ){
        description = getDescription( 0 );
        if( description.length > 20 ){
            description = description.slice( 0, 20 ) + '...';;
        }
    }

    if( isReady4Control( 0 ) ){
        ctx.fillStyle = 'rgba( 0, 0, 0 )';
    }else{
        ctx.fillStyle = 'rgba( 255, 255, 255 )';
    }
    ctx.font = "19px 'Noto Sans JP'";
    ctx.textAlign = 'center'
    ctx.fillText( description, xPosDesc, yPosDesc );

    ctx.restore();

}

const drawDescriptionDoubleMode = ( context, canvas ) => {

    let description, xPosDesc, yPosDesc;
    const ctx = context;
    ctx.save();
    
    ctx.font = "22px 'Noto Sans JP'";
    ctx.textAlign = 'center'
    ctx.fillStyle = 'rgba(255, 255, 255)';

    description = 'Double Cube Control';
    xPosDesc = canvas.width / 2;
    yPosDesc = canvas.height / 8 - 10;
    ctx.fillText( description, xPosDesc, yPosDesc );

    ctx.font = "17px 'Noto Sans JP'";
    yPosDesc = 3 * canvas.height / 4 - 48;

    description = 'Cube P';
    xPosDesc = canvas.width / 4;
    ctx.fillText( description, xPosDesc, yPosDesc );

    description = 'Cube Q';
    xPosDesc = 3 * canvas.width / 4;
    ctx.fillText( description, xPosDesc, yPosDesc );

    ctx.restore();

}

const drawStatus = ( index, context, canvas ) => {

    if( gCubeControlMode === CUBE_CONTROL_MODE_SINGLE ){
        drawStatusSingle( index, context, canvas );
    }else{
        drawStatusDouble( context, canvas );
    }

}

const drawStatusSingle = ( index, context, canvas ) => {

    const ctx = context;
    const XPOS_BASE = 2 * canvas.width / 3;
    const YPOS_BASE = canvas.height / 2 * ( index + 1 );

    ctx.save();
    
    ctx.font = "14px 'Noto Sans JP'";
    ctx.textAlign = 'left'
    ctx.fillStyle = 'rgba(255, 255, 255)';

    // Mode text
    let modeText = 'Op. Mode: ';
    modeText += OPE_MODES_NAME_ARRAY_SINGLE[ gOperationModeIndexArray[ index ] ];
    let xPosMode = XPOS_BASE;
    let yPosMode = YPOS_BASE - 100;
    ctx.fillText( modeText, xPosMode, yPosMode );

    // Max speed text
    let maxSpeedText = 'Max Speed: ';
    maxSpeedText += Math.round( gMaxSpeed[ index ] * 100 );
    let xPosMaxSpeed = XPOS_BASE;
    let yPosMaxSpeed = YPOS_BASE - 70;
    ctx.fillText( maxSpeedText, xPosMaxSpeed, yPosMaxSpeed );

    ctx.restore();

}

const drawStatusDouble = ( context, canvas ) => {

    const ctx = context;
    const XPOS_BASE = canvas.width / 3;
    const YPOS_BASE = 5 * canvas.height/8;

    ctx.save();
    
    ctx.font = "16px 'Noto Sans JP'";
    ctx.textAlign = 'left'
    ctx.fillStyle = 'rgba(0, 0, 0)';

    // Mode text
    let modeText = 'Op. Mode: ';
    modeText += OPE_MODES_NAME_ARRAY_DOUBLE[ gOperationModeIndexArray[ 0 ] ];
    let xPosMode = XPOS_BASE;
    let yPosMode = YPOS_BASE - 88;
    ctx.fillText( modeText, xPosMode, yPosMode );

    // Max speed text
    let maxSpeedText = 'Max Speed: ';
    maxSpeedText += Math.round( gMaxSpeed[ 0 ] * 100 );
    let xPosMaxSpeed = XPOS_BASE;
    let yPosMaxSpeed = YPOS_BASE - 58;
    ctx.fillText( maxSpeedText, xPosMaxSpeed, yPosMaxSpeed );

    ctx.restore();

}

const getDescription = ( index ) => {

    let description;
    const gamepad = navigator.getGamepads()[ gCurrentGamePadIndices[ index ] ];
    if( gamepad ){

        if( isJoyCon( index ) ){
            description = 'Joy-Con L+R';
        }else if( isDualShock4_1stGen( index ) ){
            description = 'DUALSHOCK 4(1st Gen)';
        }else if( isDualShock4_2ndGen( index ) ){
            description = 'DUALSHOCK 4(2nd Gen)';
        }else if( isDualSense_1stGen( index ) ){
            description = 'DualSense(1st Gen)';
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

const isReady4ControlDouble = () => {

    if( ( gCubes[ 0 ] === undefined ) || ( gCubes[ 1 ] === undefined ) 
        || ( gCubes[ 0 ].lightChar === undefined )  || ( gCubes[ 1 ].lightChar === undefined ) 
            || ( gCurrentGamePadIndices[ 0 ] === undefined ) ){
        return false;
    }else{
        return true;
    }

}

const isDualShock4_1stGen = ( gamepadIdx ) => {

    const gamepad = navigator.getGamepads()[ gCurrentGamePadIndices[ gamepadIdx ] ];
    if( gamepad ){

        const gamepadDesc = gamepad.id;
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

    const gamepad = navigator.getGamepads()[ gCurrentGamePadIndices[ gamepadIdx ] ];
    if( gamepad ){

        const gamepadDesc = gamepad.id;
        if( gamepadDesc.indexOf('Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 09cc)') !== -1 ){
            return true;
        }else{
            return false;
        }

    }else{
        return false;
    }

}

const isDualSense_1stGen = ( gamepadIdx ) => {

    const gamepad = navigator.getGamepads()[ gCurrentGamePadIndices[ gamepadIdx ] ];
    if( gamepad ){

        const gamepadDesc = gamepad.id;
        if( gamepadDesc.indexOf('Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 0ce6)') !== -1 ){
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
        window.open('https://github.com/tetunori/toioCoreCubeGampadControl/blob/master/README.md','_blank');
    });

    resetAll();
    updateStatus();

}

initialize();
