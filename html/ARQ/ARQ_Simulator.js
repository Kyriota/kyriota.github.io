// Simulate the Selective Repeat ARQ protocol

// Frame format:
// |  flag  | destination | source | sequence |      data       |   CRC    |  flag  |
// |01111110|   2 bits    | 2 bits |  4 bits  | at least 1 byte |  8 bits  |01111110|
// |  0x7E  |   0 - 3     | 0 - 3  |  0 - 15  |                 |          |  0x7E  |
// flag: marking the start and end of a frame
// destination: destination address
// source: source address
// sequence: sequence number, used to identify the frame in a window
// data: data to be sent
// CRC: CRC-8-CCITT

const START_TIME = Date.now();

const FrameSenderStatus = {
    Queuing: 0,
    Sending: 1,
    WaitingAck: 2,
    Timeout: 3,
    Acked: 4,
}

function sleep(ms) {
    console.log("Sleep " + ms + " ms")
    return new Promise(resolve => setTimeout(resolve, ms));
}

function bin2bytes(bin) {
    if (bin.length % 8 != 0) // Padding 0 to the first byte
        bin = Array(8 - bin.length % 8).fill(0).concat(bin);
    var bytes = [];
    for (var i = 0; i < bin.length; i += 8) {
        var byte = 0;
        for (var j = 0; j < 8; j++) {
            byte = byte << 1;
            if (i + j < bin.length)
                byte += bin[i + j];
        }
        bytes.push(byte);
    }
    return bytes;
}

function bytes2bin(bytes) {
    if (typeof (bytes) == "number")
        bytes = [bytes];
    var bin = [];
    for (var i = 0; i < bytes.length; i++) {
        if (bytes[i] > 255 || bytes[i] < 0)
            throw "Byte out of range";
        for (var j = 0; j < 8; j++)
            bin.push((bytes[i] >> (7 - j % 8)) & 1);
    }
    return bin;
}

function str2bytes(str) {
    // Convert a string to an array of bytes
    // Support UTF-8
    var bytes = [];
    for (var i = 0; i < str.length; i++) {
        var charCode = str.charCodeAt(i);
        if (charCode > 0xFFFF) {
            throw "Character out of range";
        }
        if (charCode < 0x80) {
            bytes.push(charCode);
        } else if (charCode < 0x800) {
            bytes.push(0xC0 | (charCode >> 6), 0x80 | (charCode & 0x3F));
        } else {
            bytes.push(0xE0 | (charCode >> 12), 0x80 | ((charCode >> 6) & 0x3F), 0x80 | (charCode & 0x3F));
        }
    }
    return bytes;
}

function bytes2str(bytes) {
    // Convert an array of bytes to a string
    // Support UTF-8 and Chinese characters
    var str = "";
    for (var i = 0; i < bytes.length; i++) {
        if (bytes[i] < 0x80) {
            str += String.fromCharCode(bytes[i]);
        } else if (bytes[i] < 0xE0) {
            str += String.fromCharCode(((bytes[i] & 0x1F) << 6) | (bytes[i + 1] & 0x3F));
            i++;
        } else {
            str += String.fromCharCode(((bytes[i] & 0x0F) << 12) | ((bytes[i + 1] & 0x3F) << 6) | (bytes[i + 2] & 0x3F));
            i += 2;
        }
    }
    return str;
}

function binArray2CubeText(bin) {
    var str = bin.join("");
    // replace 0 with ▢ and 1 with ▩
    str = str.replace(/0/g, "▢").replace(/1/g, "▩");
    return str;
}

function CubeText2binArray(str) {
    // replace ▢ with 0 and ▩ with 1 and make it bin array
    str = str.replace(/▢/g, "0").replace(/▩/g, "1").replace(/ /g, "");
    var bin = [];
    for (var i = 0; i < str.length; i++) {
        bin.push(parseInt(str[i]));
    }
    return bin;
}

function crc8(data) {
    // CRC-8-CCITT
    // data: array of bytes
    var POLY = 0x07,
        INIT = 0,
        XOROUT = 0x55;
    for (var crc = INIT, i = 0; i < data.length; i++) {
        crc = crc ^ data[i];
        for (var j = 0; j < 8; j++) {
            crc = crc & 0x80 ? crc << 1 ^ POLY : crc << 1;
        }
    }
    return (crc ^ XOROUT) & 0xFF;
}

function BitStuffing(binData) {
    var stuffed = [];
    var count = 0;
    for (var i = 0; i < binData.length; i++) {
        if (binData[i] == 1) {
            count++;
        } else {
            count = 0;
        }
        stuffed.push(binData[i]);
        if (count == 5) {
            stuffed.push(0);
            count = 0;
        }
    }
    return stuffed;
}

function BitDestuffing(binData) {
    var destuffed = [];
    var count = 0;
    for (var i = 0; i < binData.length; i++) {
        if (binData[i] == 1) {
            count++;
        } else {
            count = 0;
        }
        destuffed.push(binData[i]);
        if (count == 5) {
            i++;
            count = 0;
        }
    }
    return destuffed;
}

class FrameHelper {
    static CheckFrame(frame) {
        // Check if the frame is valid
        // frame: binary array
        // return: boolean
        if (frame.slice(0, 8).join("") != "01111110" || frame.slice(-8).join("") != "01111110")
            return false

        var payload = BitDestuffing(frame.slice(8, -8));

        var crc = payload.slice(-8);
        var crcCal = crc8(bin2bytes(payload.slice(0, -8)));

        if (crcCal != bin2bytes(crc)[0]) {
            return false
        }
        return true;
    }

    static MakeFrame(destination, source, seq, data) {
        // return: binary array

        if (destination > 3 || destination < 0 || source > 3 || source < 0 || seq > 15 || seq < 0)
            throw "Invalid destination, source or sequence";
        if (data.length == 0)
            throw "Data cannot be empty";

        var frame = [];
        var flag = bytes2bin(0x7E)
        var control = (destination << 6) | (source << 4) | seq;
        var binData = bytes2bin(data);
        if (binData.length < 8)
            binData = Array(8 - binData.length).fill(0).concat(binData);
        var crc = crc8([control].concat(bin2bytes(binData)));

        var payload = bytes2bin(control).concat(binData).concat(bytes2bin(crc));
        payload = BitStuffing(payload);

        frame = frame.concat(flag);
        frame = frame.concat(payload);
        frame = frame.concat(flag);

        return frame;
    }

    static MakeFrameFromeText(destination, source, startSeq, text, maxFrameSize) {
        // return: 2D array, each element is a binary array frame
        var frames = [];
        var data = str2bytes(text);
        var seq = startSeq;
        var maxDataSize = maxFrameSize - 24;
        for (var i = 0; i < data.length; i += maxDataSize) {
            var frameData = data.slice(i, i + maxDataSize);
            frames.push(FrameHelper.MakeFrame(destination, source, seq, frameData));
            seq = (seq + 1) % 16;
        }
        return frames;
    }

    static ExtractFrame(frame, checkFrame = true) {
        // Extract the frame into destination, source, sequence and data
        // frame: binary array
        // return: object {destination, source, sequence, data}
        if (checkFrame && !FrameHelper.CheckFrame(frame))
            return null;

        var payload = BitDestuffing(frame.slice(8, -8));

        var destination = bin2bytes(payload.slice(0, 2))[0];
        var source = bin2bytes(payload.slice(2, 4))[0];
        var sequence = bin2bytes(payload.slice(4, 8))[0];
        var data = bin2bytes(payload.slice(8, -8));

        return {
            destination: destination,
            source: source,
            sequence: sequence,
            data: data
        }
    }

    static DisplayFrameInText(frame, split = "<br>", end = "<br><br>") {
        // Display the frame in text
        // frame: binary array
        // return: string
        var frameObj = FrameHelper.ExtractFrame(frame);
        if (frameObj == null)
            return null;
        if (frameObj.data.length == 1) {
            if (frameObj.data[0] == 0x01)
                return " x Sequence: " + frameObj.sequence + split + "ACK Frame" + end;
            else if (frameObj.data[0] == 0x00)
                return " x Sequence: " + frameObj.sequence + split + "NAK Frame" + end;
        }
        return " @ Sequence: " + frameObj.sequence + split + " + Data: " + bytes2str(frameObj.data).slice(0, 25) + (bytes2str(frameObj.data).length > 25 ? " ... " : "") + end;
    }

    static FrameFinder(buffer, minFrLen) {
        // Find the first frame in the buffer by searching for the flags
        // buffer: binary array
        // return: {first frame in the buffer, start, end} or null
        if (buffer.length < minFrLen)
            return null;

        // Find the start of the frame
        var start = 0;
        while (
            buffer.slice(start, start + 8).join("") != "01111110" &&
            start + minFrLen < buffer.length
        )
            start++;
        if (start + minFrLen > buffer.length || buffer.slice(start, start + 8).join("") != "01111110")
            return null;

        // Find the end of the frame
        var end = buffer.length;
        while (
            buffer.slice(end - 8, end).join("") != "01111110" &&
            end - minFrLen > start
        )
            end--;
        if (end - minFrLen < start || buffer.slice(end - 8, end).join("") != "01111110")
            return null;

        return {
            frame: buffer.slice(start, end),
            start: start,
            end: end
        };
    }
}

class Host {
    constructor(simulator, id, UpperLayerFunc = () => { return; }) {
        this.sim = simulator;
        this.id = id;
        this.UpperLayerFunc = UpperLayerFunc;
        this.tickFlag = false;
        this.ui = null;
        this.sendingFrame = false;
        this.tickCnt = 0;

        this.sentBitCnt = 0;
        this.processedBitCnt = 0;

        simulator.hostList.push(this);

        this.receiveBinBuffer = []; // binary array

        this.sendWinSeq = 0;
        this.frameSender = [];
        // array of {frame, receiverID, binIndex, sequence, feedback, controlFrame, timeout, status}

        this.receiveFrameBuffer = Array(this.sim.para.winLen).fill(null);
        this.receiveWinSeq = 0; // sequence number of the first frame in the receive window

        this.Ticker = setInterval(() => {
            if (!this.tickFlag)
                this.Tick();
            else
                console.log("Host " + this.id + " is still ticking")
        }, this.sim.para.tick);
    }

    Tick() {
        this.tickFlag = true;
        this.SendListener();
        this.ReceiveListener();
        this.tickCnt++;
        this.tickFlag = false;
    }

    CheckACK(frameData) {
        // Check if the frame is an ACK or NAK frame
        // return: boolean
        if (frameData.length != 1)
            return false;
        if (frameData[0] == 0x00 || frameData[0] == 0x01)
            return true;
        return false;
    }

    PushToReceiveFrameBuffer(extractedFrame) {
        // push the extracted frame to the receive frame buffer
        var sequence = extractedFrame.sequence;

        var distance = Math.min((this.receiveWinSeq - sequence + this.sim.para.seq) % this.sim.para.seq, (sequence - this.receiveWinSeq + this.sim.para.seq) % this.sim.para.seq);
        if (distance == 0) {
            this.receiveFrameBuffer[0] = extractedFrame;
        } else {
            var expected = []
            for (var i = 1; i < this.sim.para.winLen; i++)
                expected.push((this.receiveWinSeq + i) % this.sim.para.seq);
            if (expected.indexOf(sequence) == -1) {
                console.log("Host " + this.id + " repeated frame " + sequence + " as now is already to frame " + this.receiveWinSeq);
                return;
            }
            this.receiveFrameBuffer[expected.indexOf(sequence) + 1] = extractedFrame;
            console.log("👉Host " + this.id + " Added frame " + sequence + " to receive buffer " + "as " + expected.indexOf(sequence) + 1);
            console.log(this.receiveFrameBuffer);
        }

        while (this.receiveFrameBuffer[0] != null) {
            this.UpperLayerFunc(this.receiveFrameBuffer[0].data);

            console.log("▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁")
            console.log("👇Host " + this.id + " Removed frame " + this.receiveWinSeq + " from receive buffer");
            console.log("ASCII: " + bytes2str(this.receiveFrameBuffer[0].data));
            console.log("▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔")
            this.receiveFrameBuffer.shift();
            this.receiveFrameBuffer.push(null);
            this.receiveWinSeq = (this.receiveWinSeq + 1) % this.sim.para.seq;
            console.log("👀 Host " + this.id + " Now receive window is at " + this.receiveWinSeq);
        }
    }

    HandleControlFrame(extractedFrame) {
        for (var i = 0; i < this.sim.para.winLen; i++) {
            var fs = this.frameSender[i];
            if (fs == null || fs.sequence != extractedFrame.sequence)
                continue;
            fs.timeout = null;
            fs.feedback = true;
            if (extractedFrame.data[0] == 0x01) {
                console.log("    👮🟢Host " + this.id + " received ACK frame " + extractedFrame.sequence + " from host " + extractedFrame.source);
                if (this.ui) {
                    this.ui.LogInfo("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;👮‍🟢 Received ACK frame" + extractedFrame.sequence, "frameSenderBufferLog");
                }
                fs.status = FrameSenderStatus.Acked;
                break;
            }
            console.log("    👮🔴Host " + this.id + " received NAK frame " + extractedFrame.sequence + " from host " + extractedFrame.source);
            if (this.ui) {
                this.ui.LogInfo("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;👮🔴 Received NAK frame " + extractedFrame.sequence, "frameSenderBufferLog");
            }
            fs.binIndex = 0;
            break;
        }
    }

    HandleDataFrame(extractedFrame) {
        // Check if the frame is in the receive window
        var distance = Math.min((this.receiveWinSeq - extractedFrame.sequence + this.sim.para.seq) % this.sim.para.seq, (extractedFrame.sequence - this.receiveWinSeq + this.sim.para.seq) % this.sim.para.seq);
        if (distance >= this.sim.para.winLen + 1) {
            console.log("❌Host " + this.id + " received frame " + extractedFrame.sequence + " from host " + extractedFrame.source + " out of window");
            return;
        }

        // Send ACK frame to the source
        var fbFrame = FrameHelper.MakeFrame(
            extractedFrame.source,
            this.id,
            extractedFrame.sequence, [0x01]
        );
        this.LoadFrameToSender(fbFrame);

        // Save the frame to the receive buffer
        this.PushToReceiveFrameBuffer(extractedFrame);
    }

    HandleCorruptedFrame(extractedFrame) {
        // check if the sender id is in the host list, if so, send NAK frame to the source
        if (this.sim.FindHostById(extractedFrame.source) != null) {
            var fbFrame = FrameHelper.MakeFrame(
                extractedFrame.source,
                this.id,
                extractedFrame.sequence, [0x00]
            );
            this.LoadFrameToSender(fbFrame);
            if (this.ui) {
                this.ui.LogInfo("&nbsp;&nbsp;✋🏻 Sent NAK to " + extractedFrame.source + " about frame " + extractedFrame.sequence, "receiveBinBufferLog");
            }
        } else if (this.ui) {
            this.ui.LogInfo("&nbsp;&nbsp;❌ Source info corrupted, dropped", "receiveBinBufferLog");
        }
    }

    ReceiveListener() {
        // Listen to the receive bin buffer, extract frame and push to receive frame buffer

        // Check if the first 8 bytes are a valid flag
        if (
            this.receiveBinBuffer.length >= 8 &&
            this.receiveBinBuffer.slice(0, 8).join("") != "01111110"
        ) {
            // If not, remove the first byte
            this.receiveBinBuffer.shift();
            this.processedBitCnt++;
            return;
        }

        if (this.receiveBinBuffer.length < this.sim.para.minFrLen)
            return

        // Check if there is valid flag at the middle of the buffer
        if (
            this.receiveBinBuffer.length >= 40 &&
            this.receiveBinBuffer.slice(1, this.receiveBinBuffer.length - 1).join("").indexOf("01111110") != -1
        ) {
            // If yes, remove the bytes before the flag
            if (this.ui) {
                this.ui.LogInfo("♊ Two or more flag in first " + this.sim.para.minFrLen + " bits", "receiveBinBufferLog");
            }
            var flagIndex = this.receiveBinBuffer.slice(1, this.receiveBinBuffer.length - 1).join("").indexOf("01111110");
            this.receiveBinBuffer = this.receiveBinBuffer.slice(flagIndex);
            this.processedBitCnt += flagIndex;
            return;
        }

        // if there is enough data to extract a frame
        var fFinder = FrameHelper.FrameFinder(this.receiveBinBuffer, this.sim.para.minFrLen);
        if (!fFinder)
            return;

        var frame = fFinder.frame;
        this.receiveBinBuffer = this.receiveBinBuffer.slice(fFinder.end);
        this.processedBitCnt += fFinder.end;

        // Extract the frame
        if (FrameHelper.CheckFrame(frame)) { // if the frame is valid
            var extractedFrame = FrameHelper.ExtractFrame(frame);

            if (this.CheckACK(extractedFrame.data)) {
                // If it's a ACK or NAK frame, check frame sender and update the buffer
                // This also shows the host is the sender in this conversation
                this.HandleControlFrame(extractedFrame);
            } else {
                this.HandleDataFrame(extractedFrame);
                if (this.ui) {
                    this.ui.LogInfo("📧 Valid data frame " + extractedFrame.sequence + " found, sent it to Frame Receive Buffer", "receiveBinBufferLog");
                }
            }
        } else { // if the frame is corrupted, try to extract and send NAK
            console.warn("[CORRUPTED] Host " + this.id + " received corrupted frame");
            console.warn("[CORRUPTED] frame: ", frame);

            if (this.ui) {
                this.ui.LogInfo("❓ Corrupted frame received, trying to handle", "receiveBinBufferLog");
            }

            var extractedFrame = FrameHelper.ExtractFrame(frame, false);
            this.HandleCorruptedFrame(extractedFrame);
        }
    }

    LoadFrameToSender(frame) {
        var extractedFrame = FrameHelper.ExtractFrame(frame);
        this.frameSender.push({
            frame: frame.slice(),
            receiverID: extractedFrame.destination,
            binIndex: 0,
            sequence: extractedFrame.sequence,
            feedback: false,
            controlFrame: this.CheckACK(extractedFrame.data),
            timeout: null, // timeout = null means the frame is not sent yet
            status: FrameSenderStatus.Queuing,
        });
    }

    SendListener() {
        // Listen to the send frame buffer, send the frame to the destination using Selective Repeat ARQ protocol
        if (this.frameSender.length == 0) {
            return;
        }

        // when not sending frame, check if there is any control frame, if so, make the first control frame found the top of the buffer
        for (var i = 0; i < this.frameSender.length && !this.sendingFrame; i++) {
            if (this.frameSender[i].controlFrame == true) {
                console.log("👆👆👆Contorl frame has moved to the top of the buffer")
                if (this.ui) {
                    this.ui.LogInfo("👆👆👆 Contorl frame has moved to the top of the buffer", "frameSenderBufferLog");
                }
                this.frameSender.unshift(this.frameSender.splice(i, 1)[0]);
                break;
            }
        }

        while (
            this.frameSender.length > 0 &&
            this.frameSender[0].status == FrameSenderStatus.Acked
        ) {
            console.log("      🚮 Host " + this.id + " Removed frame " + this.frameSender[0].sequence + " from sender buffer");
            console.log("👀 Host " + this.id + " Now the send window is at " + this.frameSender[0].sequence)
            if (this.ui) {
                this.ui.LogInfo("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;🚮 Removed frame " + this.frameSender[0].sequence, "frameSenderBufferLog");
            }
            this.frameSender.shift();
        }

        // Find the frame that is being sending or frist frame waiting to be sent
        var currentFrameIndex = -1;
        for (var i = 0; i < this.sim.para.winLen && i < this.frameSender.length; i++) {
            var currentFS = this.frameSender[i];
            if (
                currentFS.timeout == null &&
                (currentFS.feedback == false || currentFS.binIndex != currentFS.frame.length)
            ) {
                if (!currentFS.feedback) {
                    currentFrameIndex = i;
                    break;
                }
                if (!this.sendingFrame) {
                    currentFrameIndex = i;
                    break;
                }
            }
        }

        if (currentFrameIndex == -1) {
            // When all frames in the window are sent
            // Check time out in the window range
            for (var i = 0; i < this.sim.para.winLen && i < this.frameSender.length; i++) {
                var currentFS = this.frameSender[i];
                if (currentFS.timeout != null && (this.tickCnt > currentFS.timeout)) {
                    // If time out, reset the frame and send it again

                    console.log("⏰Host " + this.id + " time out frame " + currentFS.sequence + " to host " + currentFS.receiverID);
                    console.log(currentFS.timeout)
                    console.log(this.tickCnt)
                    if (this.ui) {
                        this.ui.LogInfo("⏰ Time out frame " + currentFS.sequence, "frameSenderBufferLog");
                    }

                    currentFS.status = FrameSenderStatus.Timeout;
                    currentFS.binIndex = 0;
                    currentFS.timeout = null;
                    currentFrameIndex = i;
                    break;
                }
            }
        }

        if (currentFrameIndex == -1) {
            this.sendingFrame = false;
            return;
        }

        // Send a bit of the frame to the destination
        var destination = this.sim.FindHostById(this.frameSender[currentFrameIndex].receiverID);
        var currentFS = this.frameSender[currentFrameIndex];

        // Update the frameSenderInfo
        if (currentFS.binIndex != currentFS.frame.length) {

            if (currentFS.binIndex == 0) {
                this.sendingFrame = true;
                var frameContent = bytes2str(FrameHelper.ExtractFrame(currentFS.frame).data);
                console.log("📡Host " + this.id + " sending frame:  \"" + frameContent + "\"  to host " + currentFS.receiverID + " (sequence: " + currentFS.sequence);
                if (this.ui) {
                    this.ui.LogInfo("📡 Sending frame " + currentFS.sequence + (currentFS.controlFrame ? " (control frame)" : ""), "frameSenderBufferLog");
                }
                currentFS.status = FrameSenderStatus.Sending;
                currentFS.feedback = false;
            }

            destination.receiveBinBuffer.push(currentFS.frame[currentFS.binIndex])

            var destHost = this.sim.hostList[this.id == 0 ? 1 : 0];
            this.sentBitCnt++;

            // ================================================================================
            // Mannually corrupting the bit randomly
            // ================================================================================
            if (Math.random() < this.sim.para.corRate) {
                destination.receiveBinBuffer[destination.receiveBinBuffer.length - 1] = 1 - destination.receiveBinBuffer[destination.receiveBinBuffer.length - 1];

                // Judge which part of the frame is corrupted
                if (currentFS.binIndex < 8) {
                    console.warn("🔴Host " + this.id + " corrupted the header of frame " + currentFS.sequence + " to host " + currentFS.receiverID);
                } else if (currentFS.binIndex < 10) {
                    console.warn("🔴Host " + this.id + " corrupted the destination of frame " + currentFS.sequence + " to host " + currentFS.receiverID);
                } else if (currentFS.binIndex < 12) {
                    console.warn("🔴Host " + this.id + " corrupted the source of frame " + currentFS.sequence + " to host " + currentFS.receiverID);
                } else if (currentFS.binIndex < 16) {
                    console.warn("🔴Host " + this.id + " corrupted the sequence of frame " + currentFS.sequence + " to host " + currentFS.receiverID);
                } else if (currentFS.binIndex < currentFS.frame.length - 16) {
                    console.warn("🔴Host " + this.id + " corrupted the data of frame " + currentFS.sequence + " to host " + currentFS.receiverID);
                } else if (currentFS.binIndex < currentFS.frame.length - 8) {
                    console.warn("🔴Host " + this.id + " corrupted the checksum of frame " + currentFS.sequence + " to host " + currentFS.receiverID);
                } else {
                    console.warn("🔴Host " + this.id + " corrupted the end of frame " + currentFS.sequence + " to host " + currentFS.receiverID);
                }

                var anotherUI = this.sim.hostList[this.id == 0 ? 1 : 0].ui;
                if (anotherUI) {
                    if (currentFS.binIndex < 8) {
                        anotherUI.LogInfo("🔴 Manually corrupted a bit { header } of frame " + currentFS.sequence + (currentFS.controlFrame ? " (control frame)" : ""), "receiveBinBufferLog");
                    } else if (currentFS.binIndex < 10) {
                        anotherUI.LogInfo("🔴 Manually corrupted a bit { destination } of frame " + currentFS.sequence + (currentFS.controlFrame ? " (control frame)" : ""), "receiveBinBufferLog");
                    } else if (currentFS.binIndex < 12) {
                        anotherUI.LogInfo("🔴 Manually corrupted a bit { source } of frame " + currentFS.sequence + (currentFS.controlFrame ? " (control frame)" : ""), "receiveBinBufferLog");
                    } else if (currentFS.binIndex < 16) {
                        anotherUI.LogInfo("🔴 Manually corrupted a bit { sequence } of frame " + currentFS.sequence + (currentFS.controlFrame ? " (control frame)" : ""), "receiveBinBufferLog");
                    } else if (currentFS.binIndex < currentFS.frame.length - 16) {
                        anotherUI.LogInfo("🔴 Manually corrupted a bit { data } of frame " + currentFS.sequence + (currentFS.controlFrame ? " (control frame)" : ""), "receiveBinBufferLog");
                    } else if (currentFS.binIndex < currentFS.frame.length - 8) {
                        anotherUI.LogInfo("🔴 Manually corrupted a bit { checksum } of frame " + currentFS.sequence + (currentFS.controlFrame ? " (control frame)" : ""), "receiveBinBufferLog");
                    } else {
                        anotherUI.LogInfo("🔴 Manually corrupted a bit { end } of frame " + currentFS.sequence + (currentFS.controlFrame ? " (control frame)" : ""), "receiveBinBufferLog");
                    }
                }

                if (destHost.ui) {
                    destHost.ui.errorArr.push(this.sentBitCnt - 1)
                }

            }
            // ================================================================================

            currentFS.binIndex++;
            if (currentFS.controlFrame == true && currentFS.binIndex == currentFS.frame.length) {
                console.log("  🔵Host" + this.id + " sent control frame " + currentFS.sequence + " to host " + currentFS.receiverID);
                if (this.ui) {
                    this.ui.LogInfo("&nbsp;&nbsp;🔵 Sent control frame " + currentFS.sequence, "frameSenderBufferLog");
                }
                // remove current frame from the buffer due to it's control frame and has been sent
                this.frameSender.splice(currentFrameIndex, 1);
            }
        } else {
            
            this.sendingFrame = false;

            if (currentFS.timeout == null && currentFS.feedback == false) {
                currentFS.timeout = this.tickCnt + this.sim.para.timeout;
                // log a message to say that timeout is set
                console.log("  ⌚Host " + this.id + " timer started for frame " + currentFS.sequence + " to host " + currentFS.receiverID);
                if (this.ui) {
                    this.ui.LogInfo("&nbsp;&nbsp;⌚ Timer started for frame " + currentFS.sequence, "frameSenderBufferLog");
                }
                currentFS.status = FrameSenderStatus.WaitingAck;
            }
        }
    }

    SendMessage(message, receiverID) {
        // Generate frames and add it to the frameSender
        var frameList = FrameHelper.MakeFrameFromeText(receiverID, this.id, this.sendWinSeq, message, this.sim.para.maxFrLen);
        this.sendWinSeq = (this.sendWinSeq + frameList.length) % this.sim.para.seq;
        for (var i = 0; i < frameList.length; i++) {
            this.LoadFrameToSender(frameList[i]);
        }
    }
}

class Simulator {
    constructor(initHostNum, para) {
        // JS grammar trap: even these parameters have default values, you can't use foo(a,c=xxx) to escape parameter b
        // so why don't I use {} to wrap the parameters

        this.hostList = [];
        var timeout = para.timeout;
        console.log("Timeout is: " + timeout + "ms according to the tick and frame length")
        this.para = {
            seq: para.seq, // Squence has 4 bits if SEQ = 16
            winLen: para.windowlen, // Window length
            tick: para.tick, // Tick in milliseconds
            minFrLen: para.minFrameLen, // Minimum frame length
            maxFrLen: para.maxFrameLen, // Maximum frame length
            corRate: para.corruptionRate, // Corruption rate of the channel
            timeout: timeout // Timeout in tick, meaning after how many ticks the sender will resend the frame
        };

        for (var i = 0; i < initHostNum; i++) {
            var _ = new Host(this, i);
        }
    }

    FindHostById(id) {
        for (var i = 0; i < this.hostList.length; i++) {
            if (this.hostList[i].id == id)
                return this.hostList[i];
        }
        return null;
    }
}

class HostUI {
    constructor(host, simulator) {
        this.host = host;
        this.host.ui = this;
        this.sim = simulator;
        this.messageBuffer = [];
        this.errorArr = [];

        // hostX_userInput, input textare
        this.userInputUI = document.getElementById("host" + host.id + "_userInput");
        // hostX_sendButton, button
        this.sendButtonUI = document.getElementById("host" + host.id + "_sendButton");
        // hostX_frameSenderBuffer, div
        this.frameSenderUI = document.getElementById("host" + host.id + "_frameSenderBuffer");
        // hostX_receiveBinBuffer, div
        this.receiveBinBufferUI = document.getElementById("host" + host.id + "_receiveBinBuffer");
        // hostX_frameReceiverBuffer, div
        this.frameReceiverUI = document.getElementById("host" + host.id + "_frameReceiverBuffer");
        // hostX_message, textarea
        this.messageUI = document.getElementById("host" + host.id + "_message");

        this.sendButtonUI.onclick = () => {
            if (this.userInputUI.value != "") {
                this.host.SendMessage(this.userInputUI.value, this.host.id == 0 ? 1 : 0);
            }
        }

        host.UpperLayerFunc = this.ShowInMessageUI.bind(this);

        // set interval to update the UI
        this.uiTicker = setInterval(() => {
            this.Update();
        }, this.sim.para.tick / 2);
    }

    LogInfo(message, logger) {
        // log a message to the host_{logger}
        // logger: frameSenderBufferLog, receiveBinBufferLog
        var logUI = document.getElementById("host" + this.host.id + "_" + logger);
        if (logUI != null) {
            var date = new Date();
            var time = date.toLocaleTimeString() + ": ";
            logUI.innerHTML += message + "<br>";
            logUI.scrollTop = logUI.scrollHeight;
        }
    }

    ShowInMessageUI(message) {
        this.messageUI.value = "";
        var date = new Date();
        var time = date.toLocaleTimeString();
        this.messageBuffer.push({ message: message, time: time });
        for (var i = 0; i < this.messageBuffer.length; i++) {
            this.messageUI.value += this.messageBuffer[i].time + " | " + bytes2str(this.messageBuffer[i].message) + "\n";
        }
        // scroll to the bottom
        this.messageUI.scrollTop = this.messageUI.scrollHeight;
    }

    Update() {
        this.UpdateFrameSenderUI();
        this.UpdateReceiveBinBufferUI();
        this.UpdateFrameReceiveBufferUI();
    }

    UpdateFrameSenderUI() {
        this.frameSenderUI.innerHTML = "";
        // remove all child
        while (this.frameSenderUI.firstChild) {
            this.frameSenderUI.removeChild(this.frameSenderUI.firstChild);
        }
        for (var i = 0; i < this.host.frameSender.length; i++) {
            var frSenderInfo = this.host.frameSender[i];
            var frameUI = document.createElement("div");
            frameUI.className = "frame";
            frameUI.innerHTML = FrameHelper.DisplayFrameInText(frSenderInfo.frame);
            // adjust text size
            frameUI.style.fontSize = 3 + "px";
            // adjust text color
            if (frSenderInfo.status == FrameSenderStatus.Sending) {
                frameUI.style.color = "rgb(51, 204, 255)"; // blue
            } else if (frSenderInfo.status == FrameSenderStatus.Acked) {
                frameUI.style.color = "rgb(51, 255, 0)"; // green
            } else if (frSenderInfo.status == FrameSenderStatus.Queuing) {
                frameUI.style.color = "white";
            } else if (frSenderInfo.status == FrameSenderStatus.Timeout) {
                frameUI.style.color = "rgb(255, 51, 51)"; // red
            } else if (frSenderInfo.status == FrameSenderStatus.WaitingAck) {
                frameUI.style.color = "rgb(255, 236, 139)"; // yellow
            }
            this.frameSenderUI.appendChild(frameUI);
        }
    }

    UpdateReceiveBinBufferUI() {
        // Update errorArr, drop expired errors
        for (var i = 0; i < this.errorArr.length; i++) {
            if (this.errorArr[i] < this.host.processedBitCnt) {
                this.errorArr.splice(i, 1);
                i--;
            }
        }
        var binText = binArray2CubeText(this.host.receiveBinBuffer);
        this.receiveBinBufferUI.innerHTML = "";
        // remove all child
        while (this.receiveBinBufferUI.firstChild) {
            this.receiveBinBufferUI.removeChild(this.receiveBinBufferUI.firstChild);
        }
        for (var i = 0; i < binText.length; i++) {
            if (this.errorArr.indexOf(i + this.host.processedBitCnt) == -1) {
                this.receiveBinBufferUI.innerHTML += binText[i];
            } else {
                // append span child
                var span = document.createElement("span");
                span.className = "error";
                span.innerHTML = binText[i];
                this.receiveBinBufferUI.appendChild(span);
            }
            if (i % 8 == 7) {
                this.receiveBinBufferUI.innerHTML += " ";
            }
        }
        // scroll to bottom
        this.receiveBinBufferUI.scrollTop = this.receiveBinBufferUI.scrollHeight;

        if (this.errorArr.length == 0) {
            this.receiveBinBufferUI.style.border = "3px solid green";
        } else if (this.errorArr.length > 0 && this.errorArr.length < 8) {
            this.receiveBinBufferUI.style.border = "3px solid red";
        }
    }

    UpdateFrameReceiveBufferUI() {
        this.frameReceiverUI.innerHTML = "";
        // remove all child
        while (this.frameReceiverUI.firstChild) {
            this.frameReceiverUI.removeChild(this.frameReceiverUI.firstChild);
        }
        for (var i = 0; i < this.host.receiveFrameBuffer.length; i++) {
            var extractedFrame = this.host.receiveFrameBuffer[i];
            var frameUI = document.createElement("div");
            frameUI.className = "tempFrame";
            if (extractedFrame == null) {
                frameUI.innerHTML = "{ ----------------------------------- }";
            } else {
                var dataStr = bytes2str(extractedFrame.data);
                if (dataStr.length > 25) {
                    dataStr = dataStr.slice(0, 25) + "...";
                }
                frameUI.innerHTML = "{ " + dataStr + " }";
            }
            frameUI.style.textAlign = "center";
            frameUI.style.fontSize = 5 + "px";
            this.frameReceiverUI.appendChild(frameUI);
        }
    }
}

var sim = new Simulator(2, {
    seq: 16,
    windowlen: 4,
    tick: 5,
    minFrameLen: 40,
    maxFrameLen: 60,
    timeout: 500,
    corruptionRate: 0.002
});
var h0 = sim.FindHostById(0);
var h1 = sim.FindHostById(1);
var h0UI = new HostUI(h0, sim);
var h1UI = new HostUI(h1, sim);