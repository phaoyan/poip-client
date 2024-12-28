# Participants of POIP

Currently, the POIP contract has only two types of participants:  
1. **Producers of intellectual property (referred to as "authors")**  
2. **Buyers of intellectual property (referred to as "readers")**.  

There is no platform operator! This means that once an author publishes a work on POIP, the ownership of the work remains entirely in the author’s hands. When readers purchase a work on POIP, the money either goes entirely to the author as compensation (before reaching the *goal count*) or is distributed as a bonus refund to all buyers, achieving the ultimate goal of public ownership of intellectual property. Therefore, this quick start guide is designed primarily for these two roles: authors and readers.

---

## Readers

POIP is extremely user-friendly for readers! On the **Browse** page, you’ll find all the works published on POIP. Each work includes details like a cover, title, description, and price. By clicking **View Details**, you can enter the details page of a specific work and then purchase the work by clicking **Purchase and Download**. To complete the purchase, readers need to confirm two transactions:

1. **Purchase transaction on Solana:** This means readers pay for the work via the release contract, and a **Payment account** is generated on Solana to verify the transaction.  
   
2. **Signing a message:** Readers need to sign a message, which is sent to the author's secret key service. The secret key service verifies the signed message to confirm that it was indeed sent by the reader. Then, the secret key service checks whether the reader has a valid **Payment account** on Solana. If confirmed, the secret key service sends the decryption key of the work to the reader, who can then decrypt and download the file automatically.

Once the decryption is complete, the intellectual property file is downloaded locally, and the purchase process is complete!

---

### Bonus Mechanism

The POIP contract includes a **bonus refund mechanism**, which means the money initially spent by readers can be reimbursed through subsequent buyers. Theoretically, as long as a work is popular enough and the *goal count* and *max count* are reasonably set, the final price of any work can be nearly free, with bonuses covering the initial purchase price.  

This aligns with POIP’s core philosophy: Authors should receive reasonable and limited compensation for their knowledge production. However, for a very popular intellectual property, there may be thousands of paying readers. Beyond the author’s fair compensation, all additional funds are refunded to readers. As a result, the price of the intellectual property becomes increasingly affordable, ultimately approaching public ownership.

For readers, bonuses can be claimed by going to the **details page** of the purchased intellectual property and clicking the **Bonus** button. If the total number of buyers is below the *goal count*, the money is paid to the author as compensation. However, once the *goal count* is exceeded, readers can claim refunds directly from the contract.

---

## Authors

POIP imposes two main requirements on authors:  

1. **Set up Pinata IPFS services**: This is free, as Pinata provides a generous free storage allowance.  
2. **Deploy a Secret Key Service (SKS)**: The code for this is provided on GitHub, and a tutorial is available below. Whether this incurs a fee depends on your choice of cloud service provider—Google offers a generous free tier.  

---

### Why is IPFS Service Needed?

POIP does not have a platform operator, so authors must manage their intellectual property themselves. If your intellectual property is stored solely on your local computer, others obviously cannot access it. IPFS (InterPlanetary File System) is designed to provide equal file storage services for everyone worldwide. Once your file is uploaded to IPFS, anyone can download it through a link. IPFS’s distributed backup system across multiple nodes also avoids single-point failures.  

Pinata is an IPFS service provider that offers a generous free tier, which should be sufficient for most intellectual property storage needs. After registering for an account on Pinata, you can create an API Key in the Pinata console to obtain the **Pinata Gateway** and **Pinata JWT**, which are required when publishing your intellectual property.

---

### Why is the Secret Key Service (SKS) Needed?

Files stored on IPFS are openly accessible to everyone. However, authors often want only paying readers to access the actual content of their intellectual property until it is publicly owned. Therefore, intellectual property files stored on IPFS should be encrypted. Readers can only access the decryption key if they have a valid **Payment account** on Solana.  

How can this process be conveniently managed? This is where the Secret Key Service comes in. This service responds to readers’ key requests.

Why can’t the key service be entrusted to a third party?  
- First, handing over the key service means handing over the keys themselves, which exposes authors to potential risks if the third party acts maliciously.  
- Second, realistically, third-party service providers will require authors to pay fees to maintain operations. However, can such a simple service sustain itself solely on fees? This is highly questionable.  

For now, the simplest and most feasible approach is for authors to deploy their own key service. The service consumes minimal computing resources, so as long as your cloud provider offers a free tier, authors won’t incur additional costs. The key service is part of the project, and the code is already written. Authors only need a few simple commands to deploy their own key service on the cloud.

---

### How to Publish Your Intellectual Property on POIP

Publishing intellectual property is mainly done on the **Publish** page. Simply fill out the form on the page to complete the publishing process. The form includes the following fields:  

1. **Upload File**: Upload your intellectual property file here. The file will be encrypted and uploaded to IPFS. Since the file is encrypted, you don’t need to worry about its public accessibility on IPFS. Encrypting the file will generate a **Key** and an **IV** (Initialization Vector), which will be displayed to you afterward.  
2. **SKS URL**: The URL of your Secret Key Service.  
3. **Pinata Gateway & Pinata JWT**: These authenticate your access to your Pinata account. The Pinata Gateway and JWT only exist locally on your machine and are not stored on the Solana blockchain or IPFS, ensuring their security.  
4. **Title, Filename, and Description**: These describe your intellectual property. This information will be stored publicly on IPFS, allowing readers to learn about your work.  
5. **Cover**: The cover image of the work, which will also be stored publicly on IPFS.  
6. **Price, Token, Goal Count, and Max Count**: These configure the pricing details of your work.  

   - **Price**: The unit price of the work.  
   - **Token**: The token used for pricing, such as wSOL, USDT, USDC, etc. (Currently, only SPL-token standard tokens are supported).  
   - **Goal Count**: The target number of sales. Until this goal is reached, all payments from readers are treated as compensation for the author. The total revenue cap for the author is **Price × Goal Count**.  
   - **Max Count**: After reaching the goal count, additional payments from readers will be distributed as refunds to previous buyers until the total number of sales reaches the max count. Once the max count is reached, the contract automatically transitions the intellectual property to public ownership, meaning the work becomes freely accessible to everyone.  

7. After clicking **Publish**, you’ll need to confirm two transactions:  
   - The first transaction publishes the intellectual property on the Solana blockchain.  
   - The second transaction publishes the sale information on the blockchain.  

   Once the transactions are confirmed, a popup will display the **IP (IPID)**, **Key**, and **IV** of your work. Be sure to save these in a secure location, as this will be your only opportunity to view the Key and IV. Afterward, you can input the IPID, Key, and IV into your key service, allowing readers to purchase your work.

---

### Earnings Withdrawal

Payments from readers are not directly sent to the author’s wallet. Instead, they are held in the work’s contract account. This is because the money could either be used as compensation for the author or as refunds for readers. Authors can withdraw their earnings by going to the intellectual property’s **details page** (accessible via **Dashboard > Published IPs > View Details**) and clicking the **Withdraw** button.

---

### Modifying Works

In principle, modifications to the original content of a work are not allowed after publication. This ensures that any changes do not infringe on the rights of readers who have already purchased the work. If a work has already been publicly owned, modifying the original content would be even more inappropriate.

However, POIP encourages authors to release updated versions of their works as new independent works. A feature allowing previous buyers to access updated versions for free is currently under development—stay tuned.  

---

### Modifying Work Descriptions

The description of a work can be modified at any time. Simply go to the work’s **details page**, click **Edit**, and update the information as needed. This includes editing the title, description, cover, etc.

---

### If You Don’t Want to Deploy a Key Service

If you prefer not to deploy a key service, you can use the following alternative:  
Directly publish the decryption key and still keep the paid purchase option available. In this case, theoretically, anyone can download your intellectual property for free, while “paying” becomes a way for readers to support you.  

Technically, the intellectual property remains yours until the number of sales reaches the max count, but in reality, anyone can freely download it. This approach is akin to “authorized piracy” by the author. If you’re comfortable with this, you can skip deploying a key service. After publishing your work, go to the work’s **details page**, click **Edit**, and input the decryption Key and IV. Once confirmed, readers will no longer need to request the key from any key service. Instead, they can retrieve the Key and IV from the description information to decrypt the file themselves. But that means anybody can access your intellectrual property by first downloading the encrypted IP file from IPFS，then copying the secret key and IV from the introduction metadata, and finally performing decryption by himself.