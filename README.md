# heidrun-fermenter
Logs and visualize fermenting of beer. 

`npm install`
`npm start`

`sudo modprobe w1-gpio`
`sudo modprobe w1-therm`
`cd /sys/bus/w1/devices`

Connect DS18B20 to the GPIO
positive 3.3 (pin#1) on raspi to pin 3 on DS18B20
ground (pin#6 on raspi), to pin 1 on DS18B20
Data (pin#7 on raspi) to pin 2 on DS18B20
Remember to put a `4.7Ω` resistor between 3.3v and data
