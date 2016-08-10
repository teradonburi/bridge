//
//  ViewController.swift
//  bridge
//
//  Created by 寺井 大樹 on 2016/08/06.
//  Copyright © 2016年 寺井 大樹. All rights reserved.
//

import UIKit
import WebKit

class ViewController: UIViewController, WKNavigationDelegate {
    
    var webView:WKWebView!

    override func viewDidLoad() {
        super.viewDidLoad()
        webView = WKWebView(frame: self.view.frame)
        self.view.addSubview(webView)
        
        webView.navigationDelegate = self
        
        let urlopt = NSBundle.mainBundle().URLForResource("index", withExtension: "html")
        if let url = urlopt {
            print("url: \(url)")
            
            let directory = url.URLByDeletingLastPathComponent!
            print("directory: \(directory)")
            
            let fileManager = NSFileManager.defaultManager()
            let temporaryDirectoryPath = NSTemporaryDirectory()
            let temporaryDirectoryURL = NSURL(fileURLWithPath: temporaryDirectoryPath)
            print("temporary directory: \(temporaryDirectoryURL)")
            
        
            do{
                
                try fileManager.createDirectoryAtPath(temporaryDirectoryPath, withIntermediateDirectories: true,attributes:[:])
                
                //let targetURL = temporaryDirectoryURL.URLByAppendingPathComponent("www")
                
                let htmlURL = temporaryDirectoryURL.URLByAppendingPathComponent("index.html")
                /*
                let htmlopt:NSString = try NSString(contentsOfURL: htmlURL, encoding: NSUTF8StringEncoding)
                if let html:NSString = htmlopt {
                    let originalHTML = try NSString(contentsOfURL: url, encoding: NSUTF8StringEncoding)
                    if html != originalHTML {
                        print("delete and copy.")
                        try fileManager.removeItemAtURL(temporaryDirectoryURL)
                        try fileManager.copyItemAtURL(directory, toURL: temporaryDirectoryURL)
                    }
                } else {
                    print("copy.")
                    try fileManager.copyItemAtURL(directory, toURL: temporaryDirectoryURL)
                }
                */
                try fileManager.removeItemAtURL(temporaryDirectoryURL)
                try fileManager.copyItemAtURL(directory, toURL: temporaryDirectoryURL)
                
                let request = NSURLRequest(URL: htmlURL)
                webView.loadRequest(request)
                
               

            }catch{
            }
        }
        
    }
    
    func webView(webView: WKWebView, didFinishNavigation navigation: WKNavigation!) {
        let jscript = "sum(1,2);"
        self.webView.evaluateJavaScript(jscript, completionHandler: { (object, error) -> Void in
            let ret = object as! NSNumber
            print( "答え: \(ret)" )
            
        })
    }
    

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }


}

