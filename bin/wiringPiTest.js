var wpi = require("pi-led");


const COMMAND = 0x4;
const RD = 0x6;
const WR = 0x5;
const SYS_DIS = 0x00;
const COMMON_8NMOS = 0x20;
const COMMON_8PMOS = 0x28;
const MASTER_MODE = 0x14;
const INT_RC = 0x18;
const SYS_EN = 0x01;
const LED_ON = 0x03;
const LED_OFF = 0x02;
const PWM_CONTROL = 0xA0;
const BLINK_ON = 0x09;
const BLINK_OFF = 0x08;


function simpleTest() {
    wpi.pin_mode(0, wpi.PIN_MODE.OUTPUT);
    wpi.pin_mode(1, wpi.PIN_MODE.OUTPUT);

    wpi.digital_write(0, wpi.WRITE.LOW);
    wpi.digital_write(1, wpi.WRITE.LOW);

    sendCommand(SYS_EN);
    sendCommand(LED_ON);
    sendCommand(MASTER_MODE);
    sendCommand(INT_RC);
    sendCommand(COMMON_8NMOS);

}

function sendCommand(command) {
    var data = COMMAND;

    data <<= 8;
    data |= command;
    data <<= 5;

}


function sureDisplay() {

    function init() {
        wpi.pin_mode(0, wpi.PIN_MODE.OUTPUT);
        wpi.pin_mode(1, wpi.PIN_MODE.OUTPUT);

        /*
         for (i = 0; i < m; i++) {
         modules[i].setChip(i);
         modules[i].init();
         }
         */
    }

    function setBrightness(pwm) {
        if (pwm > 15)
        {
            pwm = 15;
        }

        sendCommand(PWM_CONTROL | pwm);
    }

    function selectChip() {

        switch (this.chip) {
            case 0:
                wpi.digital_write(0, wpi.WRITE.LOW);
                wpi.digital_write(1, wpi.WRITE.LOW);

                break;

            case 1:

                wpi.digital_write(0, wpi.WRITE.LOW);
                wpi.digital_write(1, wpi.WRITE.HIGH);

                break;

            case 2:
                wpi.digital_write(0, wpi.WRITE.HIGH);
                wpi.digital_write(1, wpi.WRITE.LOW);
                break;

            case 3:
                wpi.digital_write(0, wpi.WRITE.HIGH);
                wpi.digital_write(1, wpi.WRITE.HIGH);
                break;


        }
    }


    function initChip() {
        sendCommand(SYS_EN);
        sendCommand(LED_ON);
        sendCommand(MASTER_MODE);
        sendCommand(INT_RC);
        sendCommand(COMMON_8NMOS);
        sendCommand(BLINK_ON);
        setBrightness(15);
    }

    function setChip(chipIdx) {
        this.chip = chipIdx;
    }

    function sendCommand(command) {

        var data = COMMAND;

        data <<= 8;
        data |= command;
        data <<= 5;


        //reverseEndian(&data, sizeof(data));
        selectChip();
        //wiringPiSPIDataRW(0, (uint8_t *) &data, 2);
    }

}
