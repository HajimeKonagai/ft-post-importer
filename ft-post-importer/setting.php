<?php

$updated = false;
$file_exist = false;
$options_key = FtPostImporter::$_options_key;

$file = get_option(FtPostImporter::$_options_key, 'ft-post-importer.json');

if ($_POST)
{
	if (isset($_POST[FtPostImporter::$_options_key]))
	{
		update_option(FtPostImporter::$_options_key, $_POST[FtPostImporter::$_options_key]);
		$file = get_option(FtPostImporter::$_options_key);
		$updated = true;
	}
}

$file_exist = file_exists(get_template_directory().DIRECTORY_SEPARATOR.$file);

?>


<?php if ($updated) : ?>
<div id="message" class="updated notice notice-success is-dismissible">
	<p>更新しました</p>
</div>
<?php endif; ?>

<?php if (!$file_exist) : ?>
<div id="message" class="notice notice-warning is-dismissible">
	<p>テーマフォルダ内に<?php echo $file; ?>が見つかりません。</p>
</div>
<?php endif; ?>


<form method="post">
<table class="widefat fixed" cellspacing="0">
	<tbody>
		<tr>
			<th>設定ファイル</th>
			<td>テーマフォルダ内/<input type="text" name="<?php echo FtPostImporter::$_options_key; ?>" value="<?php echo $file; ?>" size="100!"></td>
		</tr>
	</tbody>
	<tfoot>
		<tr>
			<th colspan="4">
				<input type="submit" value="更新" class="button button-primary button-large">
			</th>
		</tr>
	</tfoot>
</table>
</form>

