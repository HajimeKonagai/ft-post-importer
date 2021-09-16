<?php
/**
 * FT Post Importer
 *
 * Plugin Name: FT Post Importer
 * Plugin URI:  https://functiontales.com/***
 * Description: csv import create update
 * Version:     0.1.0
 * Author:      alex@functiontales.com
 * Author URI:  #
 * License:     #
 * License URI: #
 * Text Domain: ft-post-importer
 * Domain Path: #
 * Requires at least: #
 * Tested up to: #
 * Requires PHP: 5.2.4
 *
 * Description ###
 */

class FtPostImporter
{
	public static $_options_key = 'ft-post-importer-file';
	public static $_options_key_config = 'ft-post-importer-config';

	function __construct()
	{
		add_action('admin_menu', array($this, 'add_pages'));


		add_action( 'wp_ajax_ft_post_importer', [ $this, 'api_action_import'] );
		add_action( 'wp_ajax_ft_post_importer_config', [ $this, 'api_action_config'] );
	}


	public static function getConfigJson()
	{
		// ファイルを参照
		$config_filename = get_template_directory().DIRECTORY_SEPARATOR.get_option( static::$_options_key, 'ft-posttype-controller.json' );
		$config_file = file_exists($config_filename) ? file_get_contents($config_filename): false;

		return $config_file ?: false;
	}


	function add_pages()
	{
		add_menu_page('FT Post Importer', 'FT Post Importer',  'level_8', __FILE__, array($this, 'page'), '', 26);
		//add_menu_page( $page_title, $menu_title, $capability, $menu_slug, $function, $icon_url, $position ); 
		
		//add_submenu_page( $parent_slug, $page_title, $menu_title, $capability, $menu_slug, $function);
		add_submenu_page( __FILE__, '設定', '設定', 'level_8', __FILE__.'-setting', array($this, 'setting'));
	}

	function page()
	{
		echo '<div id="post-importer">no render</div>';
		// 対象 post type
		// 対象の post type の
		//オブション画面に表示する内容

		// TODO ファイルがなければ警告を表示
		wp_enqueue_script( 'ft-post-importer-js', plugin_dir_url(__FILE__).'js/app.js', [ 'wp-element' ], '1.0.0', true );
		wp_localize_script('ft-post-importer-js', 'JsData', array(
			'config' => static::getConfigJson(),
			'ajax_url' => admin_url('admin-ajax.php'),
			'template_directory_uri' => get_template_directory_uri(),
			'loading' => '<img src="'.get_template_directory_uri().'/images/loading.gif" alt="読み込み中">'
		));

		echo
		'<style>
		table.widefat,
		table.widefat td, .widefat th
		{
			border: 1px solid #ccc;
			border-collapse: collapse;
		}
		table.widefat thead tr th
		{
			background-color: #2c3338;
			color: #fff;
		}
		div.setting
		{
			margin-bottom: 5px;
			padding: 3px;
			border: 1px solid #ccc;
		}
		div.setting label,
		div.setting > .label
		{
			display: block;
			margin-bottom: 3px;
		}
		div.setting > .label.border
		{
			margin-bottom: 5px;
			padding: 3px;
			border: 1px solid #ccc;
		}
		span.links
		{
			margin-left: 1em;
		}
		span.links a
		{
			border: 1px solid #ccc;
			border-radius: 3px;
		}
		</style>';

	}

	function setting()
	{
		include_once(__DIR__.'/ft-post-importer/setting.php');
	}


	function api_action_import()
	{
		if (!isset($_POST['posts']) || !is_array($_POST['posts'])) return;
		global $wpdb;

		// live run
		$live    = isset($_POST['live']) && $_POST['live'];
		$empty_value = isset($_POST['setting']['empty_value']) && $_POST['setting']['empty_value'];
		$multiple    = isset($_POST['setting']['multiple']) && $_POST['setting']['multiple'];
		$create      = isset($_POST['setting']['create']) && isset($_POST['setting']['create']);

		// search なければ検索しない
		$search_to      = isset($_POST['search']['to']) ? $_POST['search']['to'] : false;
		$search_compare = isset($_POST['search']['compare']) && strtolower($_POST['search']['compare']) == 'like' ? 'LIKE': '=';
		$search = ($search_to && $search_compare) ? true: false;

		// echo json_encode($_POST); die();

		$import_results = array();
		foreach ($_POST['posts'] as $index => $data)
		{
			$results = [];
			/**
			 * search post
			 */
			if ($search && isset($data['search']) && $data['search'])
			{

				$post_types_query = "";
				if (isset($_POST['post_types']) && is_array($_POST['post_types']))
				{
					$post_types_query = " AND `".$wpdb->posts."`.post_type IN ('".implode("','", $_POST['post_types'])."') ";
					foreach ($_POST['post_types'] as $post_type)
					{
					}
				}

				if (in_array($search_to, [
					'ID',
					'post_title',
					'post_content',
					'post_excerpt',
				]))
				{
					$query = "SELECT ID FROM $wpdb->posts
						WHERE ".esc_sql($search_to)." ".$search_compare." %s
							$post_types_query
							AND `$wpdb->posts`.post_status NOT IN ('inherit', 'auto-draft', 'trash');";
				}
				else
				{
					$query = "SELECT `$wpdb->posts`.ID FROM $wpdb->posts
						INNER JOIN $wpdb->postmeta ON `$wpdb->posts`.ID = `$wpdb->postmeta`.post_id
						WHERE
							`$wpdb->postmeta`.meta_key = ".esc_sql($search_to)."
							AND `$wpdb->postmeta`.meta_value ".$search_compare." %s
							$post_types_query
							AND `$wpdb->posts`.post_status NOT IN ('inherit', 'auto-draft', 'trash');";
				}

				$results = $wpdb->get_results( $wpdb->prepare( $query,
					$data['search']
				) );
			}

			/**
			 * import
			 */
			if (count($results) == 1)
			{

				$import_result = static::import($results, $data, $live, $empty_value);

				$import_results[$index] = [
					'live'    => $live,
					'status'  => 'success',
					'type'  => 'update',
					'index'   => $index,
					'import_result' => $import_result,
				];

			}
			else if (count($results) > 1)
			{
				if ($multiple)
				{
					$import_result = static::import($results, $data, $live, $empty_value);

					$import_results[$index] = [
						'live'    => $live,
						'status'  => 'success',
						'type'  => 'update',
						'index'   => $index,
						'import_result' => $import_result,
					];
				}
				else
				{
					$import_result = [];
					foreach ($results as $result)
					{
						$import_result[$result->ID] = [
							'view' => get_the_permalink($result->ID),
							'editb' => str_replace('&amp;', '&', get_edit_post_link($result->ID)),
							'edit' => admin_url('post.php?post='.$result->ID.'&action=edit'),
						];
					}

					$import_results[$index] = [
						'live'    => $live,
						'status'  => 'error',
						'message' => '検索結果が2件以上あります。',
						'index'   => $index,
						'import_result' => $import_result,
					];
				}
			}
			else // 0 件 もしくは search がない
			{
				if ($create)
				{
					$post_id = false;
					$insert = [];
					$meta = [];
					foreach ($data['fields'] as $fieldname => $fieldvalue)
					{
						if (in_array($fieldname, [
							'post_title',
							'post_content',
							'post_excerpt',
						]))
						{
							$change[$fieldname] = ['', $fieldvalue];
							$insert[$fieldname] = $fieldvalue;
						}
						else // meta
						{
							$change[$fieldname] = ['', $fieldvalue];
							$meta[$fieldname] = $fieldvalue;
						}
					}

					if ($live)
					{
						$post_id = wp_insert_post($insert);
						foreach ($meta as $fieldname => $fieldvalue)
						{
							update_post_meta($post_id, $fieldname, $fieldvalue);
						}
					}

					$import_result = [];
					$import_result[$post_id] = [
						'change' => $change,
						'view' => get_the_permalink($post_id),
						'editb' => str_replace('&amp;', '&', get_edit_post_link($post_id)),
						'edit' => admin_url('post.php?post='.$post_id.'&action=edit'),
					];

					$import_results[$index] = [
						'live'    => $live,
						'status'  => 'success',
						'type'  => 'create',
						'index'   => $index,
						'import_result' => $import_result,
					];


				}
				else
				{
					$import_results[$index] = [
						'live'    => $live,
						'status'  => 'error',
						'message' => '検索結果が0件です。',
						'index'   => $index,
						'import_result' => false,
					];
				}
			}
		}

		echo json_encode($import_results);
		die();

		foreach (array(
			'fileEncode',
			'splitName',
			'colName',
			'colImport',
			'agreeInputs',
		) as $key)
		{
			if (isset($_POST[$key]))
			{
				$settings[$key] = $_POST[$key];
			}
		}


		$result = update_option('csv_import_settings', $settings);

		echo json_encode(array(
			'result' => $result,
			'settings' => $settings,
			'agreeInputs' => $_POST['agreeInputs']
		));
		die();
	}

	protected static function import($results, $data, $live = false, $empty_value = false)
	{
		$import_result = [];
		foreach ($results as $result)
		{
			$post = get_post($result->ID);

			$update = [];
			$change = [];
			foreach ($data['fields'] as $fieldname => $fieldvalue)
			{
				// 空値の上書きが無かつ空値だったら continue
				if (!$empty_value && $fieldvalue == '')
				{
					continue;
				}

				if (in_array($fieldname, [
					'ID',
					'post_title',
					'post_content',
					'post_excerpt',
				]))
				{
					if ($post->{$fieldname} != $fieldvalue)
					{
						$change[$fieldname] = [$post->{$fieldname}, $fieldvalue];
						$update[$fieldname] = $fieldvalue;
					}
				}
				else // meta
				{
					if ($post->{$fieldname} != $fieldvalue)
					{
						$change[$fieldname] = [$post->{$fieldname}, $fieldvalue];
						if ($live) update_post_meta($result->ID, $fieldname, $fieldvalue);
					}
				}
			}

			if ($live && $update)
			{
				$update['ID'] = $result->ID;
				wp_update_post($update);
			}

			$import_result[$result->ID] = [
				'change' => $change,
				'view' => get_the_permalink($result->ID),
				'editb' => str_replace('&amp;', '&', get_edit_post_link($result->ID)),
				'edit' => admin_url('post.php?post='.$result->ID.'&action=edit'),
			];
		}

		return $import_result;
	}


	function api_action_config()
	{
		// $_POST['config'] があれば保存
		if ($_POST['config'])
		{
			update_option(static::$_options_key_config, $_POST['config']);
		}

		$config = get_option( static::$_options_key_config );

		echo json_encode([
			'config' => $config,
		]);
		die();
	}



}
$showtext = new FtPostImporter;
