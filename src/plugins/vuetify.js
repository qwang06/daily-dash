import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';

Vue.use(Vuetify);

export default new Vuetify({
	theme: {
		themes: {
			light: {
				primary: '#22577A',
				secondary: '#C7F9CC',
				accent: '#57CC99'
	  		}
		}
	}
});