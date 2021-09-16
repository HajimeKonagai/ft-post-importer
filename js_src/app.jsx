import ReactDOM from 'react-dom';
import PostImporter from './components/PostImporter'

if (document.getElementById( 'post-importer' ))
{
	ReactDOM.render( <PostImporter
		api_url={JsData.ajax_url}
		config={JSON.parse(JsData.config)}
	/>
	, document.getElementById( 'post-importer' ) );
}


