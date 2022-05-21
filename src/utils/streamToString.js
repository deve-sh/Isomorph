const streamToString = (stream) => {
	return new Promise((resolve) => {
		let string = "";
		stream.on("data", function (data) {
			string += data.toString();
		});

		stream.on("end", function () {
			resolve(string);
		});
	});
};

export default streamToString;
