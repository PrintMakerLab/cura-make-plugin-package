export type PackageInfo = {
	description: string;
	display_name: string;
	package_id: string;
	package_type: string;
	package_version: string;
	sdk_version: number;
	sdk_version_semver: string;
};

export type PluginInfo = {
	name: string;
	author: string;
	description: string;
	version: string;
	minimum_cura_version: string;
	api: string;
	supported_sdk_versions: string[];
	'i18n-catalog': string;
};
