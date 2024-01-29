import { Component } from '@angular/core';
import { DataService } from '../../../services/data.service';
import { ModalController, NavParams } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { EventService } from '../../../services/event.service';

@Component({
  selector: 'app-search-to-customlist',
  templateUrl: './search-to-customlist.page.html',
  styleUrls: ['./search-to-customlist.page.scss'],
})
export class SearchToCustomListPage {

  name:any;
  localJsonData:any;

  constructor(
    public data: DataService,
    private eventService: EventService
  ) { 
    
  }

  ionViewWillEnter() {
    this.localJsonData = this.data.JsonData;
  }

  searchResult:any;
  searchResultCount=0;
  localList:any;
  searchText:any;
  showFilter = false;
  onSearchFocus(){
    this.showFilter = true;
  }
  onLoseFocus(){
    if(this.searchText==null||this.searchText==""){
      this.showFilter = false;
    }
  }
  onSearchCancel(){
    this.showFilter = false;
    this.displayResult = [];
  }
  onSearchChanged(){
    let key = "";
    if(this.searchText!=null){
      key = this.searchText.trim();
    }

    if(key=="")
    {
      this.displayResult = [];
      return;
    }

    //最多支持5个关键字 空格分隔 缩小查询范围
    let keys = key.split(' ');

    if(key.length==0){
      this.searchResult = this.localJsonData.filter((e:any)=>
        (e.text).indexOf(key)>-1
      );
    }
    else
    {
      this.searchResult = this.localJsonData.filter((e:any)=>
        (e.text).indexOf(keys[0])>-1
      );
    
      if(keys.length>1){
        this.searchResult = this.searchResult.filter((e:any)=>
          (e.text).indexOf(keys[1])>-1
        );
        if(keys.length>2){
          this.searchResult = this.searchResult.filter((e:any)=>
            (e.text).indexOf(keys[2])>-1
          );

          if(keys.length>3){
            this.searchResult = this.searchResult.filter((e:any)=>
              (e.text).indexOf(keys[3])>-1
            );
            
            if(keys.length>4){
              this.searchResult = this.searchResult.filter((e:any)=>
                (e.text).indexOf(keys[4])>-1
              );
            }
          }
        }
      } 
    } 

    this.searchResultCount = this.searchResult.length;
    
    this.displayResult = [];
    this.generateItems();
  }
  displayResult:any = [];
  isAuthor = false;
  private generateItems() {
    //check if keyword is author
    let foundAuthor = this.data.authorJsonData.filter((p:any)=>p.name==this.searchText)
    if(foundAuthor.length===1){
      this.isAuthor = true;
    }
    else{
      this.isAuthor = false;
    }
    //get search result
    this.displayResult = this.displayResult.concat(
      this.searchResult.splice(0,Math.min(this.searchResultCount,10))
    );
    console.log('before set add')
    console.log(this.displayResult)

    let poemIdsInCustomList = this.data.currentCollectLike.data.list.map((obj:any)=>obj.id);
    let poemTextInCustomList = this.data.currentCollectLike.data.list.map((obj:any)=>
      obj.title+obj.author+obj.paragraphs.join('_')
    );
    this.displayResult.forEach((element:any) => {
      if(element.id!=null){
        if(poemIdsInCustomList.includes(element.id)){
          element.added = true;
        }
      }
      else{
        if(poemTextInCustomList.includes(element.title+element.author+element.paragraphs.join('_'))){
          element.added = true;
        }
      }
      
    });
    //console.log('this.data.currentCollectLike')
    //console.log(this.data.currentCollectLike)
    //console.log('displayResult')
    //console.log(this.displayResult)
  }

  addtocustomlist(p:any){
    p.added = true;
    this.data.currentCollectPoem = p;
    //console.log(p)
    this.data.addtocustomlist(this.data.currentCollectLike);
    //update parent datalist
    this.eventService.triggerMyEvent({ someData: 'bailintest data' });

  }

  getHighlight(p:any){
    let result = "";
    p.paragraphs.forEach((s:any) => {
      if(s.indexOf(this.searchText)>-1)
      {
        result = s;
      }
    });
    p.sample = this.searchText;
    result = result ===""?p.paragraphs[0]:result;
    return result.replace(this.searchText,"<b>"+this.searchText+"</b>");

  }
}
