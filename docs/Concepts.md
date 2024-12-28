# Project Concepts

Knowledge, as the crystallization of human civilization, should naturally possess the characteristic of being boundless, serving as a shared public wealth for all humanity. However, under the current system centered on intellectual property (IP) rights, the boundless nature of knowledge has, to some extent, been subsumed into the interests of capital, restricting its free dissemination and sharing. By reexamining the true destination of knowledge, the labor value of its producers, and the possibilities offered by social technologies, we can explore a new path toward the public ownership of knowledge. This article, based on the concept of POIP (Public Ownership of IP), seeks to explore how technological and institutional innovation can achieve the genuine publicization of knowledge.

#### The Nature and Destination of Knowledge: Beyond the Logic of Capital

The essence of knowledge lies in its boundlessness. Unlike tangible goods that are consumed when used, knowledge can be amplified and expanded through dissemination, functioning as a public resource. Throughout history, many great ideas, technologies, and cultural achievements have generated tremendous social value through free dissemination. However, when knowledge becomes entangled within the logic of capital, its boundless nature is curtailed, even turning into a monopolized resource. The rightful destination of knowledge should not be capital but the public domain. This aligns not only with the intrinsic characteristics of knowledge but also with the basic principles of social equity.

Under the current intellectual property regime, knowledge often becomes privatized, serving as a tool for capital to extract monopoly rents. Publishing companies and patent-holding entities frequently use the monopolistic nature of intellectual property to extract profits far exceeding the labor value inherent in the production of knowledge. Meanwhile, the true laborers of knowledge production—authors, scientists, and artists—may not receive rewards commensurate with their labor value. This institutional framework not only deviates from the principle that knowledge should serve society as a whole but also exacerbates inequalities in knowledge production and dissemination.

#### Compensation for Knowledge Producers and Institutional Restructuring

While critiquing the current system, we must also confront a reality: the labor of knowledge producers must be fully respected and compensated. The production of knowledge is an endeavor requiring creativity, time, and effort, and its value must not be overlooked. Therefore, any attempt to redefine the ownership and dissemination of knowledge must ensure that producers receive rewards proportional to their labor input.

However, such compensation does not necessarily need to rely on monopoly rents derived from intellectual property rights. With innovations in technology, it is possible to ensure that knowledge producers receive fair returns while maintaining the fairness of knowledge dissemination. Blockchain technology, for instance, presents a technical avenue for the equitable distribution of knowledge. Through blockchain, we can implement a novel model for knowledge dissemination and payment: when users purchase a knowledge product, the payment can be equitably distributed among the creator and other consumers. In this way, once creators receive adequate compensation, the cost of knowledge dissemination can be gradually shared among all consumers, ultimately achieving the goals of shared and low-cost access to knowledge.

#### Respecting the Aspirations of Authors and Readers

Rethinking the ownership and dissemination of knowledge concerns not only the interests of producers but also the aspirations of every knowledge consumer. Authors who cherish their works would ideally want their creations to reach a global audience rather than being confined to specific capitalists or platforms. Only when works are read and appreciated by more people can they achieve their greatest social value. Similarly, as readers, we would hope that the money we spend on acquiring knowledge contributes to the publicization of knowledge rather than merely becoming a source of monopolized profit for platforms or capital.

Currently, a significant portion of the price of many knowledge products consists of platform or capital extraction, rather than direct payment to the author. This not only discourages readers from consuming knowledge but also restricts its dissemination. If we can reduce or even eliminate such capital-driven intermediaries through new technological and institutional arrangements, both authors and readers will ultimately benefit.

#### POIP: A Moderate Attempt at Knowledge Publicization

Against this backdrop, the concept of POIP offers a moderate and feasible pathway toward the publicization of knowledge. On one hand, POIP allows authors to maintain the current commercial model by setting an unattainable goal count. On the other hand, it enables authors to determine their own upper limit of remuneration based on their labor input by setting a reasonable goal count. Once this goal count is reached, the subsequent profits generated through continued sales are distributed equally among all purchasers. After a maximum count is reached, the intellectual property automatically enters the public domain. This design respects the autonomy of authors while also paving the way for the eventual publicization of knowledge.

More importantly, POIP is not merely an adjustment to a commercial model; it carries deeper societal implications. It seeks to foster a new perspective: not only should the ultimate destination of knowledge be publicization, but the ultimate destination of "profits" should also be publicization. Within this system, through collective effort, the value of knowledge can be shared by more individuals, rather than being monopolized by a few powerful capital entities.

#### The Radical Implications of POIP and Future Exploration

The attempt to implement POIP ultimately points toward a more radical notion: rethinking the organizational models within a communist society. Not only should knowledge be publicized, but "profits" should also become public property, challenging the very foundation of the capitalist system. Only by achieving the publicization of profits can exploitation be truly eradicated, paving the way for society to transition toward a communist mode of organization. POIP represents merely the first step in this direction—a challenging but hopeful endeavor!

### The POIP Contract for Public Ownership of Intellectual Property

POIP is based on blockchain technology, with its core implemented as a smart contract called the "Buyout Compensation Publicization Contract." This contract has undergone two iterations, from simple to more nuanced designs. Understanding the evolution of this contract offers a clear insight into the underlying principles of POIP. The iterations are as follows:

#### Buyout Cap Contract (Limited Buyout Contract)

Initially, the knowledge producer privately owns the intellectual property. They specify a maximum earnings cap (Max) and set a per-unit price for the product (Price). The number of required sales (Count) is then calculated as:

$$
Count = \frac{Max}{Price}
$$

The producer sells the product in the market. As sales progress and the actual number of sales approaches **Count**, the producer relinquishes their private ownership of the intellectual property, publicizing it for free use by everyone.

While the Buyout Cap Contract is simple and easy to implement, publicizing the intellectual property may lead to dissatisfaction among buyers, as they may prefer to wait until the product becomes free rather than paying upfront for access. To address this issue, several potential remedies can be implemented:

1. Issuing honors or recognition to early buyers.
2. Highlighting the time advantage for early buyers by delaying the publicization of the IP after reaching **Count**.
3. Adopting the following "Buyout Compensation Contract."

#### Buyout Compensation Contract

Initially, the knowledge producer privately owns the intellectual property. They specify a maximum earnings cap (Max) and set a per-unit price for the product (Price). The number of required sales (Count) is calculated as:

$$
Count = \frac{Max}{Price}
$$

The producer begins selling the product. As sales progress and the actual number of sales approaches **Count**, the producer does not immediately relinquish private ownership of the intellectual property. Subsequent purchasers of the product contribute their payments to a shared compensation pool, which is evenly redistributed to all previous buyers (including the new purchaser). Over time, the cost of accessing the product decreases for all buyers, approaching near-zero. At the same time, earlier buyers are fairly compensated, ensuring equitable payment for everyone. This effectively results in the practical publicization of the intellectual property.

To implement the redistribution of funds, the contract maintains the following records:

1. The balance of the contract account (separate from the producer's account, as this balance is used for compensating buyers; the producer cannot withdraw from it).
2. A list of buyers and the total number of buyers.
3. The amount of compensation already withdrawn by each buyer.
4. The maximum earnings cap (Max) and product price (Price).

When a new buyer purchases access to the product, they are added to the buyer list, increasing the total buyer count. The funds they contribute are added to the contract's account balance. When an existing buyer requests compensation, the contract calculates their compensation amount based on the formula:

$$
Amount = Price - \frac{Max}{BuyerCount}
$$

The contract determines the buyer's eligible compensation by subtracting the amount they have already withdrawn from the current eligible compensation. After processing the withdrawal, the buyer's total withdrawn amount is updated accordingly.

To lower the barrier for new buyers, the contract can allow for immediate compensation adjustment at the time of purchase. New buyers would only need to pay the difference between the per-unit price and their current eligible compensation to access the product. After completing the purchase, their total withdrawn compensation is updated to reflect the current eligible amount.

While the Buyout Compensation Contract ensures gradual publicization of usage rights, the ownership of the intellectual property formally remains private. To further promote the publicization of knowledge, a "Buyout Compensation Publicization Contract" can be adopted.

#### Buyout Compensation Publicization Contract (or Goal Max Contract)

Initially, the knowledge producer privately owns the intellectual property. They specify a maximum earnings cap (Max) and set a per-unit price for the product (Price). The required number of sales (Count) is calculated as:

$$
Count = \frac{Max}{Price}
$$

Additionally, the producer specifies a maximum compensation limit (**MaxCompensation**), which ideally approaches but does not exceed **Price**. As sales progress, buyers are added, and their compensation gradually increases. When the compensation for each buyer reaches **MaxCompensation**, the producer relinquishes ownership of the intellectual property, and the product becomes publicly owned.

The total number of buyers required to reach **MaxCompensation** can be calculated as:

$$
MaxBuyerCount = \frac{Max}{Price - MaxCompensation}
$$

By continuously tracking the total number of buyers, the contract ensures knowledge products are ultimately publicized when the total buyer count reaches **MaxBuyerCount**. 

This iterative framework bridges the gap between individual compensation and collective ownership, providing a practical pathway toward the publicization of knowledge.