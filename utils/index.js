function isnull(val){
	return typeof val === 'object' && !val;
}

module.exports = {
	isnull: isnull
}