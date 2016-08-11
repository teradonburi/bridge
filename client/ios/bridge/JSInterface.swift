//
//  interface.swift
//  bridge
//
//  Created by 寺井 大樹 on 2016/08/11.
//  Copyright © 2016年 寺井 大樹. All rights reserved.
//

import Foundation
import WebKit

class JSInterface: NSObject,WKNavigationDelegate{
    
    var webView:WKWebView!
    static var JSInterfaceLoaded = "JSInterfaceLoaded"

    override init(){
        super.init()
    }
    

    func load(dev:Bool,parent:UIView?) {
        
        if parent != nil {
            webView = WKWebView(frame: parent!.frame)
            parent!.addSubview(webView)
        }else{
            webView = WKWebView(frame: CGRectMake(0, 0, 100, 100))
            webView.hidden = true
        }
        
        webView.navigationDelegate = self
        
        let urlopt = NSBundle.mainBundle().URLForResource("index", withExtension: "html")
        if let url = urlopt {
            //print("url: \(url)")
            
            let directory = url.URLByDeletingLastPathComponent!
            //print("directory: \(directory)")
            
            let fileManager = NSFileManager.defaultManager()
            let temporaryDirectoryPath = NSTemporaryDirectory()
            let temporaryDirectoryURL = NSURL(fileURLWithPath: temporaryDirectoryPath)
            //print("temporary directory: \(temporaryDirectoryURL)")
            
            
            do{
                
                try fileManager.createDirectoryAtPath(temporaryDirectoryPath, withIntermediateDirectories: true,attributes:[:])
                
                let htmlURL = temporaryDirectoryURL.URLByAppendingPathComponent("index.html")
                let fileExists = fileManager.fileExistsAtPath(temporaryDirectoryPath)
                if fileExists && dev == true {
                    try fileManager.removeItemAtURL(temporaryDirectoryURL)
                    try fileManager.copyItemAtURL(directory, toURL: temporaryDirectoryURL)
                }else {
                    try fileManager.copyItemAtURL(directory, toURL: temporaryDirectoryURL)
                }
                
                let request = NSURLRequest(URL: htmlURL)
                webView.loadRequest(request)
                
                
            }catch{
            }
        }

    }
    
    // ページ読み込み完了
    func webView(webView: WKWebView, didFinishNavigation navigation: WKNavigation!) {
        NSNotificationCenter.defaultCenter().postNotificationName(JSInterface.JSInterfaceLoaded, object: nil)
    }
    
    // Javascript関数呼び出し
    func call(jscript:String,callback: ((AnyObject?, NSError?) -> Void)?){
        
        
        webView.evaluateJavaScript(jscript, completionHandler: { (object, error) -> Void in
            if callback != nil {
                return callback!(object,error)
            }
        })
    }

}