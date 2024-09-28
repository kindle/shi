import { Component } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { UiService } from 'src/app/services/ui.service';
import { AnimationController, GestureController, IonCard, IonModal, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { enterAnimation } from '../../animations/fade-animation';

@Component({
  selector: 'app-article',
  templateUrl: './article.page.html',
  styleUrls: ['./article.page.scss'],
})
export class ArticlePage {

  constructor(
    public data:DataService,
    public ui: UiService,
    private animationCtrl: AnimationController,
    private router: Router,
    //private el: ElementRef, 
    private gestureCtrl: GestureController,
    private navCtrl: NavController,
  ) { }

  ionViewWillEnter() {
    //this.data.updateLocalData('taglist');
    this.onSearchChanged();
  }

  searchResult:any;
  searchResultCount=0;
  localList:any;
  searchText:any;
  showFilter = false;
  onSearchFocus(){
    this.showFilter = true;
  }
  onSearchCancel(){
    this.showFilter = false;
  }
  onSearchChanged(){
    let key = "";
    if(this.searchText!=null){
      key = this.searchText.trim();
    }
    
    this.searchResult = this.data.myLikeArticles.filter((e:any)=>
    {
      //(e.big_title+e.small_title).indexOf(key)>=0
      // Get big_title and small_title
      const titles = e.big_title + e.small_title;

      // Flatten desc values (author, title, sample for "poem", and value for "text")
      const descValues = e.desc.map((descItem: any) => {
        if (descItem.type === 'poem') {
          return descItem.author + descItem.title + descItem.sample;
        } else if (descItem.type === 'text') {
          return descItem.value;
        }
        return '';
      }).join('_');

      // Search in titles + flattened desc values
      return (titles + descValues).indexOf(key) >= 0;
    });
    this.searchResultCount = this.searchResult.length;
    
    this.displayResult = [];
    this.generateItems();
  }
  displayResult:any = [];
  private generateItems() {
    this.displayResult = this.displayResult.concat(
      this.searchResult.splice(0,Math.min(this.searchResultCount,100))
    );
  }

  goToArticle(item:any){
    this.navCtrl.setDirection('forward', true, 'forward', enterAnimation);

    if(item.items){
      //update audio info..
      item.items.forEach((poem:any) => {
        let fullData = this.data.JsonData.filter((j:any)=>j.id===poem.id)[0];
        
        if(fullData&&fullData.audio){
          poem.audio = fullData.audio;
        }
      });
    }
    if(item.desc){
      //update audio info..
      item.desc.filter((i:any)=>i.type=='poem').forEach((poem:any) => {
        let fullData = this.data.JsonData.filter((j:any)=>j.id===poem.id)[0];
        if(fullData&&fullData.audio!=null){
          poem.audio = fullData.audio;
        }
      });
    }
    this.data.currentArticle = item;
    this.router.navigate(['article-viewer'], {
      queryParams: {
      }
    });
  }
}
