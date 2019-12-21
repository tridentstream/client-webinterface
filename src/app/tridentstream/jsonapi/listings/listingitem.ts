import { ResourceObject, JSON_TYPES } from '../jsonapi';
import { DisplayMetadataResourceObject, HistoryResourceObject } from '../metadata/index';
import { post, get, put } from '../../helpers';
import * as filesize from 'filesize';


export class ListingItemResourceObject extends ResourceObject {
  public displayMetadatas = Array<DisplayMetadataResourceObject>();
  public defaultMetadata: DisplayMetadataResourceObject;
  public _isPopulated = false;
  public forcedTitle: string;

  command(command: string, kwargs: Object = {}, search = {}) {
    let postBody = {
      command: command,
      kwargs: kwargs
    }
    return this.getDocument(search, false).populate(postBody);
  }

  getEmbeddedTitle(): string {
    let metadata = this.getRelationship('metadata_embedded');
    if (metadata == null || metadata.type != 'metadata_embedded')
      return null;

    let titleSegments = [];

    let episodeInfo = '';

    if (metadata.attributes['episodeinfo_season'] != null)
      episodeInfo = `${ episodeInfo }S${ metadata.attributes['episodeinfo_season'].toString().padStart(2, "0") }`;

    if (metadata.attributes['episodeinfo_episode'] != null)
      episodeInfo = `${ episodeInfo }E${ metadata.attributes['episodeinfo_episode'].toString().padStart(2, "0") }`;

    if (episodeInfo.length == 0) {
      if (metadata.attributes['episodeinfo_year'] != null)
        episodeInfo = `${ episodeInfo }${ metadata.attributes['episodeinfo_year'] }`;

      if (metadata.attributes['episodeinfo_month'] != null)
        episodeInfo = `${ episodeInfo }.${ metadata.attributes['episodeinfo_month'] }`;

      if (metadata.attributes['episodeinfo_day'] != null)
        episodeInfo = `${ episodeInfo }.${ metadata.attributes['episodeinfo_day'] }`;
    }

    if (metadata.attributes['episodeinfo_sub_title'] != null)
        episodeInfo = `${ episodeInfo } - ${ metadata.attributes['episodeinfo_sub_title'].replace(/^[\s\uFEFF\xA0.-]+|[\s\uFEFF\xA0.-]+$/g, '') }`;

    if (episodeInfo.length > 0)
      titleSegments.push(episodeInfo.replace(/^[\s\uFEFF\xA0.-]+|[\s\uFEFF\xA0.-]+$/g, ''));

    if (metadata.attributes['mediainfo_codec'])
      titleSegments.push(metadata.attributes['mediainfo_codec']);

    if (metadata.attributes['mediainfo_container'])
      titleSegments.push(metadata.attributes['mediainfo_container']);

    if (metadata.attributes['mediainfo_source'])
      titleSegments.push(metadata.attributes['mediainfo_source']);

    if (metadata.attributes['mediainfo_resolution'])
      titleSegments.push(metadata.attributes['mediainfo_resolution']);

    if (metadata.attributes['mediainfo_scene'])
      titleSegments.push('Scene');

    if (titleSegments.length > 0 && this.attributes['size'])
      titleSegments.push(filesize(this.attributes['size'], {round: 1}));

    if (metadata.attributes['bittorrent_seeders'] != null)
      titleSegments.push(`Seeds:${ metadata.attributes['bittorrent_seeders'] }`);

    let title = titleSegments.join(' / ');

    return title;
  }

  get isAvailable() {
    if (this.getRelationship('metadata_available') || (this.attributes['metadata'] && this.attributes['metadata']['available'])) {
      return true;
    } else {
      return false;
    }
  }

  getTitle(useForcedTitle = false): string {
    if (useForcedTitle && this.forcedTitle)
      return this.forcedTitle;

    let embeddedTitle = this.getEmbeddedTitle();
    if (embeddedTitle)
      return embeddedTitle;

    let title = this.attributes['name'];
    if (this.attributes['size'])
      title += ' / ' + filesize(this.attributes['size'], {round: 1});
    return title;
  }

  isOriginalTitle() {
    return !this.getEmbeddedTitle();
  }

  createDefaultMetadata(): DisplayMetadataResourceObject {
    this.defaultMetadata = new DisplayMetadataResourceObject('metadata_default', `metadata_default_${this.id}`);
    this.defaultMetadata.parse({'attributes': {
      title: this.getTitle(),
      populated: true
    }});
    return this.defaultMetadata;
  }

  populateMetadata(): void {
    if (this._isPopulated)
      return;
    this._isPopulated = true;

    for (let ro of this.relationshipsFlat) {
      if (ro instanceof DisplayMetadataResourceObject) {
        this.displayMetadatas.push(ro);
      }
    }
    this.displayMetadatas.push(this.createDefaultMetadata());
    this.displayMetadatas.sort((a, b) => {
      if (a.isPopulated() && !b.isPopulated())
        return -1;

      if (!a.isPopulated() && b.isPopulated())
        return 1;

      if (a.isPopulated() && b.isPopulated()) {
        if (a.type == 'metadata_default')
          return 1;

        if (b.type == 'metadata_default')
          return -1;
      }

      if (a.metadataPriority > b.metadataPriority)
        return -1;

      if (a.metadataPriority < b.metadataPriority)
        return 1;

      return 0;
    });
  }

  getMetadata(preferred?: string): DisplayMetadataResourceObject {
    this.populateMetadata();
    if (preferred)
      for (let metadata of this.displayMetadatas)
        if (metadata.type === preferred)
          return metadata;

    return this.displayMetadatas[0];
  }

  getBestMetadata(): DisplayMetadataResourceObject {
    this.populateMetadata();
    let displayMetadatas = this.displayMetadatas.slice();
    displayMetadatas.sort((a, b) => {
      if (a.metadataPriority > b.metadataPriority)
        return -1;

      if (a.metadataPriority < b.metadataPriority)
        return 1;

      return 0;
    });
    for (let displayMetadata of displayMetadatas) {
      if (displayMetadata.type == 'metadata_default')
        continue;

      return displayMetadata;
    }
  }

  getDefaultMetadata(): DisplayMetadataResourceObject {
    this.populateMetadata();
    return this.defaultMetadata;
  }

  getHistory(): HistoryResourceObject | null {
    let history = null;
    let histories = <Array<HistoryResourceObject>>this.relationships['metadata_history'];
    if (histories) {
      histories = histories['data'];
      histories.sort((a, b) => {
        if (a.attributes['created'] > b.attributes['created'])
          return -1;
        return 1;
      });
      history = histories[0];
    }
    return history;

  }

  canTag(): boolean {
    let parents = this.relationships['parent'];
    return parents && parents['data'][0].metadataHandlers.indexOf('metadata_tag') >= 0;
  }

  hasTag(tagName: string): boolean {
    let tags = this.relationships['metadata_tag'];
    if (tags) {
      for (let tag of tags['data']) {
        if (tag.attributes['tag_name'] == tagName && tag.attributes['plugin_name'] == 'tag') {
          return true;
        }
      }
    }
    return false;
  }

  untag(tagName: string) {
    this.tainted = true;
    return this.command('untag', {handler: 'tag', tag_name: tagName});
  }

  tag(tagName: string) {
    this.tainted = true;
    return this.command('tag', {handler: 'tag', tag_name: tagName});
  }

  get viewState() {
    let history = this.getHistory();
    if (history != null && history.viewStates) {
      let viewStates = history.viewStates;
      if (viewStates.length > 0) {
        return viewStates[0];
      }
    }
  }

  get isWatchOngoing(): boolean {
    return this.viewState && !this.viewState.isEmpty;
  }
}
