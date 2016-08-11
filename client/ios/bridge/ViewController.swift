//
//  ViewController.swift
//  bridge
//
//  Created by 寺井 大樹 on 2016/08/06.
//  Copyright © 2016年 寺井 大樹. All rights reserved.
//

import UIKit

class ViewController: UIViewController {
    
    var interface:JSInterface!

    override func viewDidLoad() {
        super.viewDidLoad()
        
        interface = JSInterface()
        NSNotificationCenter.defaultCenter().addObserver(self, selector: #selector(ViewController.loaded), name: JSInterface.JSInterfaceLoaded, object: nil)
        interface.load(true,parent: self.view)

    }
    
    func loaded(){
        interface.call("lib.test({data:\"test1\"});", callback:{ (object, error) -> Void in
                print( "object: \(object), error:\(error)" )
            })
        interface.call("lib.test({data:\"test2\"});", callback: { (object, error) -> Void in
            print( "object: \(object), error:\(error)" )
        })
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }


}

