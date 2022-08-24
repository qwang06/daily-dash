import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';

Vue.use(Vuetify);

export default new Vuetify({
	theme: {
		themes: {
			light: {
				primary: '#C7F9CC',
				secondary: '#22577A',
				accent: '#57CC99'
	  		}
		}
	}
});