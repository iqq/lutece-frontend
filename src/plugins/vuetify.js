import Vue from 'vue';
import {
	Vuetify, // required
	VAlert,
	VImg,
	VProgressCircular,
	VHover,
	VTooltip,
	VApp, // required
	VTextarea,
	VSubheader,
	VSwitch,
	VNavigationDrawer,
	VGrid,
	VToolbar,
	VList,
	VBtn,
	VAvatar,
	VCard,
	VMenu,
	VIcon,
	VAutocomplete,
	VDataTable,
	VPagination,
	VTabs,
	VSelect,
	VTextField,
	VForm,
	VDivider,
	VProgressLinear,
	VSnackbar,
	VDataIterator,
	transitions,
} from 'vuetify';
import { Resize } from 'vuetify/es5/directives';
import colors from 'vuetify/es5/util/colors';

Vue.use(Vuetify, {
	components: {
		VAlert,
		VImg,
		VProgressCircular,
		VHover,
		VTooltip,
		VTextarea,
		VSubheader,
		VSwitch,
		VApp,
		VNavigationDrawer,
		VGrid,
		VToolbar,
		VList,
		VBtn,
		VAvatar,
		VCard,
		VMenu,
		VIcon,
		VAutocomplete,
		VDataTable,
		VPagination,
		VTabs,
		VSelect,
		VTextField,
		VForm,
		VDivider,
		VProgressLinear,
		VSnackbar,
		VDataIterator,
		transitions,
	},
	directives: {
		Resize,
	},
	iconfont: 'mdi',
	theme: {
		primary: colors.blueGrey.darken3,
		secondary: colors.blueGrey.darken4,
		accent: colors.pink.base,
	},
});