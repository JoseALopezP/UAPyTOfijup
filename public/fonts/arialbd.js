﻿import { jsPDF } from "jspdf"
var callAddFont = function () {
this.addFileToVFS('arialbd-normal.ttf', font);
this.addFont('arialbd-normal.ttf', 'arialbd', 'normal');
};
jsPDF.API.events.push(['addFonts', callAddFont])